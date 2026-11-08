import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from 'src/auth/interfaces';
import { AuthenticatedRequest } from './interfaces';

export const CurrentUser = createParamDecorator(
    (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
        const request =
            context.switchToHttp().getRequest<AuthenticatedRequest>();

        return request.user!;
    },
);