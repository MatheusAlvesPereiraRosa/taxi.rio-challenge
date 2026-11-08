import { UserRole } from "@prisma/client";

export interface AuthUser {
    sub: string;
    role: UserRole;
    iat: number;
    exp: number;
    iss: string;
    aud: string;
}

/* Information about the authenticated user on the request */
export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AccessTokenPayload {
  sub: string;
  iat: number;
  exp: number;
}