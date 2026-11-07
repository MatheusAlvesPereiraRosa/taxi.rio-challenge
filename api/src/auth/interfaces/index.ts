export enum UserRole {
    PASSENGER = 'PASSENGER',
    DRIVER = 'DRIVER',
}

export interface AuthUser {
    sub: string;
    role: UserRole;
    iat: number;
    exp: number;
    iss: string;
    aud: string;
}