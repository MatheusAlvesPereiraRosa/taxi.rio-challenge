
import { useState } from 'react';
import { Search, ChevronRight, CarFront } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

import {
    STATUS_LABEL,
    errorMessage,
    getNextDriverStatus,
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
    const [ride, setRide] = useState<Ride | null>(null);

    const [targetStatus, setTargetStatus] = useState<RideStatus | ''>('');

    const [searching, setSearching] = useState(false);
    const [updating, setUpdating] = useState(false);

    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const nextStatus: RideStatus | null = ride
        ? getNextDriverStatus(ride.status)
        : null;

    const canUpdate =
        !!ride &&
        !!targetStatus &&
        targetStatus === nextStatus &&
        !searching &&
        !updating;

    function handleRideIdChange(value: string) {
        setRideId(value);

        // A changed ID invalidates the previously loaded ride.
        setRide(null);
        setTargetStatus('');
        setError('');
        setNotice('');
    }

    async function searchRide() {
        if (!session || !rideId.trim()) return;

        setSearching(true);
        setError('');
        setNotice('');
        setRide(null);
        setTargetStatus('');

        try {
            const foundRide = await taxiApi.getRideForDriver(
                `Bearer ${session.accessToken}`,
                rideId.trim(),
            );

            setRide(foundRide);

            const next = getNextDriverStatus(foundRide.status);
            setTargetStatus(next ?? '');

            setNotice('Ride found successfully.');
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSearching(false);
        }
    }

    async function advance() {
        if (!session || !ride || !canUpdate || !targetStatus) {
            return;
        }

        setUpdating(true);
        setError('');
        setNotice('');

        try {
            const updatedRide = await taxiApi.updateRide(
                session.accessToken,
                ride.id,
                targetStatus,
            );

            // Update the local state using the API response,
            // rather than assuming that the operation succeeded.
            setRide(updatedRide);

            const next = getNextDriverStatus(updatedRide.status);
            setTargetStatus(next ?? '');

            setNotice(
                `Ride changed to ${STATUS_LABEL[updatedRide.status]}.`,
            );
        } catch (err) {
            setError(
                `${errorMessage(err)}. Search again to refresh the current status.`,
            );
        } finally {
            setUpdating(false);
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
                    Search for a ride, check its current status and update its progress.
                </p>
            </div>

            {error && <Alert text={error} />}
            {notice && <Alert text={notice} tone="success" />}

            <div className="grid items-start gap-6 xl:grid-cols-[1.1fr_.9fr]">
                <Panel
                    title="Manage a ride"
                    detail="Find a ride using its ID"
                >
                    <div className="space-y-5">

                        {/* Search section */}
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                void searchRide();
                            }}
                            className="space-y-3"
                        >
                            <Field
                                label="Ride ID"
                                value={rideId}
                                onChange={handleRideIdChange}
                                placeholder="Paste ride UUID"
                            />

                            <button
                                type="submit"
                                disabled={!rideId.trim() || searching || updating}
                                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-600 bg-white font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Search size={18} />
                                {searching ? 'Searching...' : 'Search ride'}
                            </button>
                        </form>

                        {/* Status management — only visible after lookup */}
                        {ride && (
                            <div className="space-y-5 border-t border-slate-200 pt-5">

                                {/* Current status from MySQL */}
                                <div>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Current status
                                    </p>

                                    <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700">
                                        {STATUS_LABEL[ride.status]}
                                    </div>

                                    <p className="mt-2 text-xs text-slate-500">
                                        Current status retrieved from the API.
                                    </p>
                                </div>

                                {/* New status */}
                                <label className="block">
                                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        New status
                                    </span>

                                    <select
                                        value={targetStatus}
                                        onChange={(event) =>
                                            setTargetStatus(event.target.value as RideStatus | '')
                                        }
                                        disabled={!nextStatus || updating}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm disabled:bg-slate-50 disabled:text-slate-400"
                                    >
                                        {!nextStatus ? (
                                            <option value="">
                                                No further transitions available
                                            </option>
                                        ) : (
                                            <>
                                                <option value="">Select new status</option>
                                                <option value={nextStatus}>
                                                    {STATUS_LABEL[nextStatus]}
                                                </option>
                                            </>
                                        )}
                                    </select>

                                    <p className="mt-2 text-xs text-slate-500">
                                        Only the next valid transition is available.
                                    </p>
                                </label>

                                <button
                                    type="button"
                                    disabled={!canUpdate}
                                    onClick={() => void advance()}
                                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {updating
                                        ? 'Updating...'
                                        : nextStatus
                                            ? `Set ${STATUS_LABEL[nextStatus]}`
                                            : 'Ride finished'}

                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </Panel>

                <Panel
                    title="Ride details"
                    detail="Current ride information"
                >
                    {ride ? (
                        <RideDetails ride={ride} />
                    ) : (
                        <div className="flex flex-col items-center py-10 text-center text-slate-400">
                            <CarFront size={32} />
                            <p className="mt-3 text-sm">
                                Search for a ride to view its details
                            </p>
                        </div>
                    )}
                </Panel>
            </div>
        </>
    );
}