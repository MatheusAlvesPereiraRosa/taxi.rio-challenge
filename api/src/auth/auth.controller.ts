import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from 'src/guards/current-user.decorator';
import type { AuthenticatedUser } from './interfaces';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}
    
    @Get('me')
    getCurrentUser(@CurrentUser() user: AuthenticatedUser) {
        return user;
    }

    @Post('register')
    register(
        @Body() dto: RegisterDto
    ) {
        this.authService.register(dto);
    }

    @Post('login')
    login(
        @Body() dto: RegisterDto
    ) {
        this.authService.login(dto);
    }
}
