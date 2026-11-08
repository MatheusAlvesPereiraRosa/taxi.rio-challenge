import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from 'src/auth/auth.service';
import { AuthenticatedRequest } from './interfaces';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        /* Extract the JWT token from the Authorization header */
        const authorization = request.headers.authorization;

        if (!authorization) throw new UnauthorizedException('Authorization header is missing');

        const [scheme, token, ...extraParts] = authorization.trim().split(/\s+/);

        if (
            scheme?.toLowerCase() !== 'bearer' ||
            !token ||
            extraParts.length > 0
        ) {
            throw new UnauthorizedException('Invalid authorization header');
        }

        /* Put the user in the request object for later use in the request lifecycle */
        request.user = await this.authService.authenticate(token);

        return true;
    }
}