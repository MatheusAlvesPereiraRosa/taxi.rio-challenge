
import { useState } from 'react';
import { ChevronRight, CarFront } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

import {
    DRIVER_STATUS_FLOW,
    STATUS_FLOW,
    STATUS_LABEL,
    errorMessage,
    taxiApi,
} from '../functions';

import type { Ride, RideStatus } from '../types';

import { Alert } from '../components/ui/Alert';
import { Field } from '../components/ui/Field';
import { Panel } from '../components/ui/Panel';
import { RideDetails } from '../components/rides/RideDetails';

export function DriverPage() {
    const { session } = useAuth();

    const [rideId, setRideId] = useState('');
    const [currentStatus, setCurrentStatus] =
        useState<RideStatus>('REQUESTED');

    const [ride, setRide] = useState<Ride | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    // Drivers can accept REQUESTED rides, then advance
    // through ACCEPTED -> IN_PROGRESS -> COMPLETED.
    const index = STATUS_FLOW.indexOf(currentStatus);

    const nextStatus: RideStatus | null =
        index >= 0 && index < STATUS_FLOW.length - 1
            ? STATUS_FLOW[index + 1]
            : null;

    // Only statuses allowed for driver updates.
    const canAdvance =
        nextStatus !== null &&
        DRIVER_STATUS_FLOW.includes(nextStatus);

    async function advance() {
        if (!session || !rideId.trim() || !nextStatus || !canAdvance) {
            return;
        }

        setBusy(true);
        setError('');
        setNotice('');

        try {
            const updated = await taxiApi.updateRide(
                session.accessToken,
                rideId.trim(),
                nextStatus,
            );

            setRide(updated);
            setCurrentStatus(updated.status);

            setNotice(
                `Ride changed to ${STATUS_LABEL[updated.status]}.`,
            );
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-600">
                    TAXI.RIO / DRIVER
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-[#162745]">
                    Driver workspace
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Accept ride requests and update their progress.
                </p>
            </div>

            {error && <Alert text={error} />}
            {notice && <Alert text={notice} tone="success" />}

            <div className="grid items-start gap-6 xl:grid-cols-[1.1fr_.9fr]">
                <Panel
                    title="Manage a ride"
                    detail="Enter a ride ID and its current status"
                >
                    <div className="space-y-5">
                        <Field
                            label="Ride ID"
                            value={rideId}
                            onChange={(value) => {
                                setRideId(value);
                                setRide(null);
                                setCurrentStatus('REQUESTED');
                            }}
                            placeholder="Paste ride UUID"
                        />

                        <label className="block">
                            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Known current status
                            </span>

                            <select
                                value={currentStatus}
                                onChange={(e) =>
                                    setCurrentStatus(e.target.value as RideStatus)
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                            >
                                {STATUS_FLOW.map((status) => (
                                    <option key={status} value={status}>
                                        {STATUS_LABEL[status]}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <p className="text-xs leading-5 text-slate-500">
                            The backend's GET ride endpoint is passenger-only.
                            Drivers must provide a known ride ID and its current
                            status.
                        </p>

                        <button
                            type="button"
                            disabled={!rideId.trim() || !canAdvance || busy}
                            onClick={advance}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {busy
                                ? 'Updating...'
                                : nextStatus
                                    ? `Set ${STATUS_LABEL[nextStatus]}`
                                    : 'Ride completed'}

                            <ChevronRight size={18} />
                        </button>
                    </div>
                </Panel>

                <Panel
                    title="Last updated ride"
                    detail="Details from your successful status update"
                >
                    {ride ? (
                        <RideDetails ride={ride} />
                    ) : (
                        <div className="flex flex-col items-center py-10 text-center text-slate-400">
                            <CarFront size={32} />
                            <p className="mt-3 text-sm">No ride updated yet</p>
                        </div>
                    )}
                </Panel>
            </div>
        </>
    );
}