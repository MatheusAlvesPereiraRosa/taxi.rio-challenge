import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class RegisterDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name!: string;

    @IsEmail()
    @MaxLength(255)
    email!: string;

    @IsString()
    @MinLength(12)
    @MaxLength(128)
    password!: string;

    @IsNotEmpty()
    role: 'PASSENGER' | 'DRIVER' = 'PASSENGER';
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}