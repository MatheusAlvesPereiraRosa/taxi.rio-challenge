import { RideStatus } from '@prisma/client';

export interface RideEvent {
    eventId: string;
    eventType: 'RIDE_CREATED' | 'RIDE_STATUS_UPDATED';
    rideId: string;
    passengerId: string;
    driverId: string | null;
    status: RideStatus;
    version: number;
    occurredAt: string;
    correlationId: string;
}