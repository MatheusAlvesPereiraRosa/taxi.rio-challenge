import { STATUS_LABEL } from '../../functions';
import type { RideStatus } from '../../types';

const styles: Record<RideStatus, string> = {
    REQUESTED: 'bg-amber-50 text-amber-700 ring-amber-200',
    ACCEPTED: 'bg-sky-50 text-sky-700 ring-sky-200',
    IN_PROGRESS: 'bg-violet-50 text-violet-700 ring-violet-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    CANCELLED: 'bg-rose-50 text-rose-700 ring-rose-200',
};

export function StatusPill({ status }: { status: RideStatus }) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}>
            <span className="size-1.5 rounded-full bg-current" />{STATUS_LABEL[status]}
        </span>
    );
}
