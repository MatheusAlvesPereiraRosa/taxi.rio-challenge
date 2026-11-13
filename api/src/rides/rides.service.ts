import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRideDto, UpdateRideStatusDto } from './dto/rides.dto';
import { AuthenticatedUser } from 'src/auth/interfaces';
import { createHash, randomUUID } from 'node:crypto';
import { Prisma, RideStatus } from '@prisma/client';
import { RideEvent } from './interfaces';
import { jsonLog } from 'src/commom/logging/json-logger';

@Injectable()
export class RidesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(
        dto: CreateRideDto,
        user: AuthenticatedUser,
        idempotencyKey: string,
        correlationId: string
    ) {
        if (!idempotencyKey || idempotencyKey.length > 128) throw new BadRequestException('Invalid idempotency key');

        const requestHash = createHash('sha256')
            .update(JSON.stringify(dto))
            .digest('hex');

        try {
            const existing = await this.prisma.ride.findUnique({
                where: {
                    passengerId_idempotencyKey: {
                        passengerId: user.id,
                        idempotencyKey,
                    },
                },
            })

            if (existing) {
                if (existing.requestHash !== requestHash) {
                    throw new ConflictException(
                        'Idempotency-Key already used with a different request',
                    );
                }

                jsonLog('info', 'Idempotent ride request replayed', {
                    correlationId,
                    rideId: existing!.id,
                    passengerId: user.id,
                })

                return existing;
            }

            const result = await this.prisma.$transaction(async (tx) => {
                const ride = await tx.ride.create({
                    data: {
                        passengerId: user.id,
                        originAddress: dto.origin.address,
                        originLatitude: dto.origin.latitude,
                        originLongitude: dto.origin.longitude,
                        destinationAddress: dto.destination.address,
                        destinationLatitude: dto.destination.latitude,
                        destinationLongitude: dto.destination.longitude,
                        idempotencyKey,
                        requestHash,
                        status: RideStatus.REQUESTED,
                    },
                })

                const event: RideEvent = {
                    eventId: randomUUID(),
                    eventType: 'RIDE_CREATED',
                    rideId: ride.id,
                    passengerId: ride.passengerId,
                    driverId: ride.driverId,
                    status: ride.status,
                    version: ride.version,
                    occurredAt: new Date().toISOString(),
                    correlationId,
                }

                await tx.rideOutboxEvent.create({
                    data: {
                        id: event.eventId,
                        rideId: ride.id,
                        type: event.eventType,
                        payload: event as unknown as Prisma.InputJsonValue,
                    },
                })

                return ride
            })

            jsonLog('info', 'Ride created', {
                correlationId,
                rideId: result.id,
                passengerId: user.id,
                status: result.status,
            })

            return {
                message: 'Ride created successfully',
                ride: result
            }
        } catch (error: any) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                const ride = await this.prisma.ride.findUnique({
                    where: {
                        passengerId_idempotencyKey: {
                            passengerId: user.id,
                            idempotencyKey,
                        },
                    },
                });

                if (ride) {
                    if (ride.requestHash !== requestHash) {
                        throw new ConflictException(
                            'Idempotency-Key already used with a different request',
                        );
                    }

                    return ride;
                }
            }

            throw error;
        }
    }

    async findOne(id: string, user: AuthenticatedUser) {
        const ride = await this.prisma.ride.findUnique({
            where: { id },
        });

        if (!ride || ride.passengerId !== user.id) throw new NotFoundException('Ride not found');

        return ride;
    }

    async updateStatus(
        id: string,
        dto: UpdateRideStatusDto,
        user: AuthenticatedUser,
        correlationId: string,
    ) {
        const ride = await this.prisma.ride.findUnique({
            where: { id },
        })

        if (!ride) throw new NotFoundException('Ride not found');

        const transitions: Partial<Record<RideStatus, RideStatus>> = {
            [RideStatus.REQUESTED]: RideStatus.ACCEPTED,
            [RideStatus.ACCEPTED]: RideStatus.IN_PROGRESS,
            [RideStatus.IN_PROGRESS]: RideStatus.COMPLETED,
        }

        const expectedNextStatus = transitions[ride.status]

        if (dto.status !== expectedNextStatus) {
            throw new ConflictException(
                `Cannot change ride status from ${ride.status} to ${dto.status}`,
            );
        }

        if (ride.driverId && ride.driverId !== user.id) {
            throw new ForbiddenException(
                'This ride is assigned to another driver',
            );
        }

        /* The driver is assigned when accepting the requested ride. */
        const driverId = ride.driverId ?? user.id

        const result = await this.prisma.$transaction(async (tx) => {
            // Conditional update protects against concurrent status changes.
            const update = await tx.ride.updateMany({
                where: {
                    id,
                    status: ride.status,
                    version: ride.version,
                    driverId: ride.driverId,
                },
                data: {
                    status: dto.status,
                    driverId,
                    version: {
                        increment: 1,
                    },
                },
            })

            if (update.count !== 1) {
                throw new ConflictException(
                    'Ride was modified by another request',
                );
            }

            const updatedRide = await tx.ride.findUniqueOrThrow({
                where: { id },
            })

            jsonLog('info', 'Ride status updated', {
                correlationId,
                rideId: updatedRide.id,
                driverId: user.id,
                status: updatedRide.status,
                version: updatedRide.version,
            })

            const event: RideEvent = {
                eventId: randomUUID(),
                eventType: 'RIDE_STATUS_UPDATED',
                rideId: updatedRide.id,
                passengerId: updatedRide.passengerId,
                driverId: updatedRide.driverId,
                status: updatedRide.status,
                version: updatedRide.version,
                occurredAt: new Date().toISOString(),
                correlationId,
            }

            await tx.rideOutboxEvent.create({
                data: {
                    id: event.eventId,
                    rideId: updatedRide.id,
                    type: event.eventType,
                    payload: event as unknown as Prisma.InputJsonValue,
                },
            })

            return updatedRide
        })

        return {
            message: "Ride status updated successfully",
            updated: result
        }
    }
}
