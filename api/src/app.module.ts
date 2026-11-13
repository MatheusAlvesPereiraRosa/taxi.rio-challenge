import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RidesModule } from './rides/rides.module';
import { MessagingModule } from './messaging/messaging.module';
import { CorrelationIdMiddleware } from './commom/middleware/correlation-id.middleware';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        AuthModule, 
        PrismaModule, 
        RidesModule,
        MessagingModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule { 
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(CorrelationIdMiddleware)
            .forRoutes('*');
    }
}
