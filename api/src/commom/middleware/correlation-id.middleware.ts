import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';

import { jsonLog } from '../logging/json-logger';

export interface CorrelatedRequest extends Request {
    correlationId: string;
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
    use(
        req: CorrelatedRequest,
        res: Response,
        next: NextFunction,
    ) {
        const startedAt = performance.now();
        const incomingId = req.header('x-correlation-id');

        const correlationId =
            incomingId && /^[a-zA-Z0-9_-]{1,128}$/.test(incomingId)
                ? incomingId
                : randomUUID();

        req.correlationId = correlationId;

        res.setHeader('X-Correlation-ID', correlationId);

        res.on('finish', () => {
            const durationMs = Math.round(
                performance.now() - startedAt,
            );

            jsonLog(
                res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
                'HTTP request completed',
                {
                    correlationId,
                    method: req.method,
                    path: req.path,
                    statusCode: res.statusCode,
                    durationMs,
                },
            );
        });

        next();
    }
}