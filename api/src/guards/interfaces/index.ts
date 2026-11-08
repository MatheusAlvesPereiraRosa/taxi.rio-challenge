import { AuthenticatedUser } from "src/auth/interfaces";
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}