import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@Module({
    imports: [
        PrismaModule,
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const publicKeyPath = config.getOrThrow<string>(
                    'JWT_PUBLIC_KEY_PATH',
                );

                const privateKeyPath = config.getOrThrow<string>(
                    'JWT_PRIVATE_KEY_PATH',
                );

                const publicKey = readFileSync(resolve(process.cwd(), publicKeyPath), 'utf-8');
                const privateKey = readFileSync(
                    resolve(process.cwd(), privateKeyPath),
                    'utf8',
                )

                return {
                    publicKey,
                    privateKey,
                    signOptions: {
                        algorithm: 'RS256',
                        issuer: 'corridas-api',
                        audience: 'corridas-app',
                        expiresIn: '1h',
                    },
                    verifyOptions: {
                        algorithms: ['RS256'],
                        issuer: 'corridas-api',
                        audience: 'corridas-app',
                    }
                }
            }
        })
    ],
    providers: [
        AuthService,
        JwtAuthGuard,
        RolesGuard
    ],
    controllers: [AuthController],
    exports: [
        AuthService,
        JwtAuthGuard,
        RolesGuard
    ]
})
export class AuthModule { }
