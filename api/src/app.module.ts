import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RidesModule } from './rides/rides.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        AuthModule, 
        PrismaModule, 
        RidesModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
