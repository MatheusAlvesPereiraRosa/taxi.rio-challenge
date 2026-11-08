import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from './interfaces';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        /* Routes without a @Roles decorator don't require a specific role. */
        if (!requiredRoles || requiredRoles.length === 0) return true;

        const request = context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();

        const user = request.user;

        if (!user) throw new UnauthorizedException('User is not authenticated');

        if (!requiredRoles.includes(user.role)) throw new ForbiddenException('You do not have permission to access this resource')

        return true;
    }
}