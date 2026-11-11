import {
    IsDefined,
    IsEnum,
    IsLatitude,
    IsLongitude,
    IsString,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RideStatus } from '@prisma/client';

export class LocationDto {
    @IsString()
    @MaxLength(255)
    address!: string;

    @IsLatitude()
    latitude!: number;

    @IsLongitude()
    longitude!: number;
}

export class CreateRideDto {
    @IsDefined()
    @ValidateNested()
    @Type(() => LocationDto)
    origin!: LocationDto;

    @IsDefined()
    @ValidateNested()
    @Type(() => LocationDto)
    destination!: LocationDto;
}

export class UpdateRideStatusDto {
  @IsEnum(RideStatus)
  status!: RideStatus;
}