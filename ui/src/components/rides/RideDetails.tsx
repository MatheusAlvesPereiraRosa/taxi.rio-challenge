import { STATUS_FLOW } from '../../functions';
import type { Ride } from '../../types';
import { StatusPill } from './StatusPill';

export function RideDetails({ ride }: { ride: Ride }) {

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><StatusPill status={ride.status} /><span className="break-all font-mono text-xs text-slate-400">{ride.id}</span></div>
            <div className="space-y-5 border-l-2 border-dashed border-slate-200 pl-6">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pickup</p><p className="mt-1 font-medium text-slate-800">{ride.originAddress}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Destination</p><p className="mt-1 font-medium text-slate-800">{ride.destinationAddress}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm">
                <div><span className="text-xs text-slate-400">Created</span><p className="mt-1 font-medium text-slate-700">{new Date(ride.createdAt).toLocaleString()}</p></div>
                <div><span className="text-xs text-slate-400">Driver assigned</span><p className="mt-1 font-medium text-slate-700">{ride.driverId ? 'Yes' : 'Not yet'}</p></div>
            </div>
            <div className="grid grid-cols-4 gap-1">{STATUS_FLOW.map((status) => <div key={status} className={`h-1.5 rounded-full ${ride.status !== 'CANCELLED' && STATUS_FLOW.indexOf(ride.status) >= STATUS_FLOW.indexOf(status) ? 'bg-blue-600' : 'bg-slate-200'}`} />)}</div>
        </div>
    )
}
