import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from '../prisma/prisma.module';
import { OutboxPublisherService } from './outbox-publisher.service';

@Module({
    imports: [ConfigModule, PrismaModule],
    providers: [OutboxPublisherService],
})
export class MessagingModule { }