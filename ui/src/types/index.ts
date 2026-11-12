export type Role = 'PASSENGER' | 'DRIVER';
export type RideStatus = 'REQUESTED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export interface User { id: string; name: string; email: string; role: Role; }
export interface Session { accessToken: string; tokenType?: string; user: User; }
export interface Location { address: string; latitude: number; longitude: number; }
export interface Ride {
  id: string;
  passengerId: string;
  driverId: string | null;
  status: RideStatus;
  originAddress: string;
  originLatitude: number;
  originLongitude: number;
  destinationAddress: string;
  destinationLatitude: number;
  destinationLongitude: number;
  createdAt: string;
  updatedAt?: string;
  version?: number;
}
