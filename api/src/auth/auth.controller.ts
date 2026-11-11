import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from './interfaces';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}
    
    @Get('me')
    @UseGuards(JwtAuthGuard)
    getCurrentUser(@CurrentUser() user: AuthenticatedUser) {
        return user;
    }

    @Post('register')
    register(
        @Body() dto: RegisterDto
    ) {
        return this.authService.register(dto);
    }

    @Post('login')
    login(
        @Body() dto: LoginDto
    ) {
        return this.authService.login(dto);
    }
}
