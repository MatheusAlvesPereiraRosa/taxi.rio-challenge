import {
    Body,
    Controller,
    Get,
    Headers,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { RidesService } from './rides.service';
import { UserRole } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as interfaces from 'src/auth/interfaces';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateRideDto, UpdateRideStatusDto } from './dto/rides.dto';

@Controller('rides')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RidesController {
    constructor(private readonly ridesService: RidesService) { }

    @Post('create')
    @Roles(UserRole.PASSENGER)
    create(
        @Body() dto: CreateRideDto,
        @CurrentUser() user: interfaces.AuthenticatedUser,
        @Headers('idempotency-key') idempotencyKey: string,
        @Headers('x-correlation-id') correlationId?: string,
    ) {
        return this.ridesService.create(
            dto,
            user,
            idempotencyKey,
            correlationId || randomUUID(),
        );
    }

    @Get(':id')
    @Roles(UserRole.PASSENGER)
    findOne(
        @Param('id') id: string,
        @CurrentUser() user: interfaces.AuthenticatedUser,
    ) {
        return this.ridesService.findOne(id, user);
    }

    @Get(':id/driver')
    @Roles(UserRole.DRIVER)
    getRideForDriver(
        @Param('id') id: string,
        @CurrentUser() user: interfaces.AuthenticatedUser,
    ) {
        return this.ridesService.findForDriver(id, user);
    }

    @Patch(':id/status')
    @Roles(UserRole.DRIVER)
    updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateRideStatusDto,
        @CurrentUser() user: interfaces.AuthenticatedUser,
        @Headers('x-correlation-id') correlationId?: string,
    ) {
        return this.ridesService.updateStatus(
            id,
            dto,
            user,
            correlationId || randomUUID(),
        );
    }
}
