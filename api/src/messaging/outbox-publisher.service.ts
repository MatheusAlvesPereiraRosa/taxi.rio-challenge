import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

import { PrismaService } from '../prisma/prisma.service';

export const RIDE_QUEUE = 'ride.events';

@Injectable()
export class OutboxPublisherService
    implements OnModuleInit, OnModuleDestroy {
        
    private readonly logger = new Logger(OutboxPublisherService.name);
    private connection?: amqp.ChannelModel;
    private channel?: amqp.ConfirmChannel;
    private timer?: NodeJS.Timeout;
    private processing = false;

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    ) { }

    async onModuleInit() {
        this.timer = setInterval(() => {
            void this.publishPending().catch((error) => {
                this.logger.error('Outbox publication failed', error);
            });
        }, 1000);

        // Attempt the first batch immediately.
        void this.publishPending().catch((error) => {
            this.logger.error('Initial outbox publication failed', error);
        });
    }

    private async ensureConnection() {
        if (this.channel) return;

        this.connection = await amqp.connect(
            this.config.getOrThrow<string>('RABBITMQ_URL'),
        );

        this.connection.on('close', () => {
            this.channel = undefined;
            this.connection = undefined;
        });

        this.connection.on('error', (error) => {
            this.logger.error('RabbitMQ connection error', error);
        });

        this.channel = await this.connection.createConfirmChannel();

        await this.channel.assertQueue(RIDE_QUEUE, {
            durable: true,
        });
    }

    private async publishPending() {
        if (this.processing) return;
        this.processing = true;

        try {
            await this.ensureConnection();

            const events = await this.prisma.rideOutboxEvent.findMany({
                where: {
                    publishedAt: null,
                },
                orderBy: {
                    createdAt: 'asc',
                },
                take: 50,
            });

            for (const event of events) {
                const body = Buffer.from(JSON.stringify(event.payload));

                this.channel!.sendToQueue(RIDE_QUEUE, body, {
                    persistent: true,
                    contentType: 'application/json',
                    messageId: event.id,
                });

                // Wait for RabbitMQ to confirm receipt.
                await this.channel!.waitForConfirms();

                await this.prisma.rideOutboxEvent.update({
                    where: { id: event.id },
                    data: { publishedAt: new Date() },
                });

                this.logger.log(`Published ${event.type}: ${event.id}`);
            }
        } finally {
            this.processing = false;
        }
    }

    async onModuleDestroy() {
        if (this.timer) clearInterval(this.timer);

        // Avoid closing a channel while a batch is still being published.
        while (this.processing) {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }

        await this.channel?.close();
        await this.connection?.close();
    }
}