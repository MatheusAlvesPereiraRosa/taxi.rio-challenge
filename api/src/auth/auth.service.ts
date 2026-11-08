import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AccessTokenPayload, AuthenticatedUser } from './interfaces';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService
    ) { }

    private async createSession(user: AuthenticatedUser) {
        const accessToken = await this.jwtService.signAsync({
            sub: user.id
        })

        return {
            accessToken,
            tokenType: 'Bearer',
            user
        }
    }

    async authenticate(token: string): Promise<AuthenticatedUser> {
        try {
            /* Verify the JWT token and extract the payload */
            const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token);

            /* Validate the claims our application requires */
            if (
                typeof payload.sub !== 'string' ||
                typeof payload.iat !== 'number' ||
                typeof payload.exp !== 'number'
            ) {
                throw new UnauthorizedException('Invalid access token payload');
            }

            /* Retrieve the user from source of truth */
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                }
            })

            if (!user) throw new UnauthorizedException('User not found');

            return user
        } catch (error: any) {
            if (error instanceof UnauthorizedException) throw error

            throw new Error('Error when authenticating user', {
                cause: new Error(error.message)
            });
        }
    }

    async register(dto: RegisterDto) {
        const { name, password, role } = dto;

        try {
            const email = dto.email.trim().toLowerCase()

            const existingUser = await this.prisma.user.findUnique({
                where: { email }
            })

            if (existingUser) throw new BadRequestException('Email already in use');

            const passwordHash = await argon2.hash(password, {
                type: argon2.argon2id,
            })

            const user = await this.prisma.user.create({
                data: {
                    name,
                    email,
                    passwordHash,
                    role
                }
            })

            await this.createSession(user)

            return {
                message: 'User registered successfully'
            }
        } catch (error: any) {
            if (error instanceof BadRequestException) throw error
            console.log(error)
            throw new BadRequestException('Error when registering user', {
                description: error.message,
                cause: new Error(error.message)
            });
        }
    }

    async login(dto: LoginDto) {
        const { email, password } = dto;

        try {
            const user = await this.prisma.user.findUnique({
                where: { email: email.trim().toLowerCase() },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    passwordHash: true
                }
            })

            if (!user) throw new UnauthorizedException('Invalid email or password');

            const passwordValid = await argon2.verify(user.passwordHash, password)

            if (!passwordValid) throw new UnauthorizedException('Invalid password');

            return this.createSession({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            })
        } catch (error: any) {
            if (error instanceof UnauthorizedException) throw error

            throw new BadRequestException('Error when logging in user', {
                cause: new Error(error.message),
                description: error.message,
            });
        }
    }
}
