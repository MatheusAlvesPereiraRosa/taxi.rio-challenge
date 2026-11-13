import type { Ride } from "./types";

export interface CreateRideResponse {
    message: string;
    ride: Ride;
}

export interface UpdateRideResponse {
  message: string;
  updated: Ride;
}