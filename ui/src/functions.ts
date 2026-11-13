import type { Location, Ride, RideStatus, Session, User } from './types';

interface ApiError { message?: string | string[]; error?: string; }

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
    const response = await fetch(`/api${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
    if (!response.ok) {
        const data: ApiError = await response.json().catch(() => ({}));
        const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(message || data.error || `Request failed (${response.status})`);
    }
    return response.json() as Promise<T>;
}

export const taxiApi = {
    login: (email: string, password: string) =>
        request<Session>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (name: string, email: string, password: string) =>
        request<{ message?: string; accessToken?: string }>('/auth/register', {
            method: 'POST', body: JSON.stringify({ name, email, password }),
        }),
    me: (token: string) => request<User>('/auth/me', {}, token),
    createRide: (token: string, origin: Location, destination: Location, key: string) =>
        request<Ride>('/rides/create', {
            method: 'POST',
            headers: { 'Idempotency-Key': key },
            body: JSON.stringify({ origin, destination }),
        }, token),
    getRide: (token: string, id: string) => request<Ride>(`/rides/${encodeURIComponent(id)}`, {}, token),
    updateRide: (token: string, id: string, status: RideStatus) =>
        request<Ride>(`/rides/${encodeURIComponent(id)}/status`, {
            method: 'PATCH', body: JSON.stringify({ status }),
        }, token),
};

export function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Something went wrong.';
}

export const PASSENGER_STATUS_FLOW: RideStatus[] = ['REQUESTED', "CANCELLED"];
export const DRIVER_STATUS_FLOW: RideStatus[] = ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];
export const STATUS_FLOW: RideStatus[] = ['REQUESTED','ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];
export const PASSENGER_STATUS_LABEL: Partial<Record<RideStatus, string>> = {
    REQUESTED: 'Requested', CANCELLED: 'Cancelled',
};
export const DRIVER_STATUS_LABEL: Partial<Record<RideStatus, string>> = {
    ACCEPTED: 'Accepted', IN_PROGRESS: 'In progress',
    COMPLETED: 'Completed'
};
export const STATUS_LABEL: Record<RideStatus, string> = {
    REQUESTED: 'Requested', ACCEPTED: 'Accepted', IN_PROGRESS: 'In progress',
    COMPLETED: 'Completed', CANCELLED: 'Cancelled',
};
export const LAST_RIDE_KEY = 'taxirio_demo_ride_id';
export const PENDING_RIDE_KEY = 'taxirio_pending_ride';
