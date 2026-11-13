import { Collection, MongoClient } from "mongodb";
import { RideEvent } from "./interfaces";
import Redis from "ioredis";
import { jsonLog } from "./logging/json-logger";

interface StoreRideEvent extends RideEvent {
    processedAt: Date
}

export class RideEventProcessor {
    private collection: Collection<StoreRideEvent>;

    constructor(
        private readonly redis: Redis,
        mongo: MongoClient,
        databaseName: string
    ) {
        this.collection = mongo
            .db(databaseName)
            .collection<StoreRideEvent>('ride_events');
    }

    async initialize() {
        await this.collection.createIndex(
            { eventId: 1 },
            { unique: true }
        );
    }

    async process(event: RideEvent) {
        /* MongoDB: one audit entry per event ID */
        await this.collection.updateOne(
            { eventId: event.eventId },
            { $setOnInsert: { ...event, processedAt: new Date() } },
            { upsert: true }
        )

        /* Redis: only replace the cached status with a newer version */
        const key = `ride:${event.rideId}:status`;

        const script = `
            local existingVersion = redis.call('HGET', KEYS[1], 'version')

            if existingVersion and tonumber(existingVersion) >= tonumber(ARGV[1]) then
                return 0
            end

            redis.call(
                'HSET',
                KEYS[1],
                'version', ARGV[1],
                'status', ARGV[2],
                'driverId', ARGV[3],
                'updatedAt', ARGV[4]
            )

            return 1
        `;

        await this.redis.eval(
            script,
            1,
            key,
            event.version,
            event.status,
            event.driverId ?? '',
            event.occurredAt,
        )

        console.log(
            JSON.stringify({
                level: 'info',
                message: 'Ride event processed',
                eventId: event.eventId,
                rideId: event.rideId,
                status: event.status,
                version: event.version,
                correlationId: event.correlationId,
            }),
        )
    }
}