import { config } from 'dotenv';

config();

import * as amqp from 'amqplib';
import Redis from 'ioredis';
import { MongoClient } from 'mongodb';

import { RideEvent } from './interfaces';
import { RideEventProcessor } from './ride-event.processor';
import { jsonLog } from './logging/json-logger';

const QUEUE = 'ride.events';

function requiredEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }

    return value;
}

async function main() {
    const redis = new Redis(requiredEnv('REDIS_URL'));

    const mongo = new MongoClient(requiredEnv('MONGODB_URL'));
    await mongo.connect();

    const processor = new RideEventProcessor(
        redis,
        mongo,
        requiredEnv('MONGODB_DATABASE'),
    );

    await processor.initialize();

    const connection = await amqp.connect(
        requiredEnv('RABBITMQ_URL'),
    );

    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE, { durable: true });
    await channel.prefetch(10);

    await channel.consume(
        QUEUE,
        async (message) => {
            if (!message) return;

            let event: RideEvent;

            try {
                event = JSON.parse(message.content.toString()) as RideEvent;

                if (
                    typeof event.eventId !== 'string' ||
                    typeof event.rideId !== 'string' ||
                    !Number.isSafeInteger(event.version) ||
                    event.version < 1
                ) {
                    throw new Error('Invalid ride event payload');
                }
            } catch (error) {
                console.error('Discarding malformed event', error);

                // A malformed message cannot be repaired by retrying.
                // Later we'll send it to a dead-letter queue.
                channel.ack(message);
                return;
            }

            try {
                await processor.process(event);

                jsonLog('info', 'Ride event processed', {
                    correlationId: event.correlationId,
                    eventId: event.eventId,
                    rideId: event.rideId,
                    status: event.status,
                    version: event.version,
                })

                // Acknowledge only after both MongoDB and Redis succeed.
                channel.ack(message);
            } catch (error) {
                jsonLog('error', 'Ride event processing failed', {
                    correlationId: event.correlationId,
                    eventId: event.eventId,
                    rideId: event.rideId,
                    error: error instanceof Error ? error.message : String(error),
                    redelivered: message.fields.redelivered,
                })

                // Temporary failures can be retried.
                channel.nack(message, false, true);
            }
        },
        { noAck: false },
    );

    const shutdown = async () => {
        await channel.close();
        await connection.close();
        await redis.quit();
        await mongo.close();
        process.exit(0);
    };

    process.once('SIGINT', () => void shutdown());
    process.once('SIGTERM', () => void shutdown());
}

main().catch((error) => {
    console.error('Worker startup failed', error);
    process.exit(1);
});