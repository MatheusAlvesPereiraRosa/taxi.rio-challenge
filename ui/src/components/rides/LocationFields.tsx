import { MapPin } from 'lucide-react';
import { Field } from '../ui/Field';
import type { Location } from '../../types';

export function LocationFields({
    label,
    location,
    onChange
}: { label: string; location: Location; onChange: (next: Location) => void }) {
    return (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><MapPin size={17} className="text-blue-600" />{label}</div>
            <Field label="Address" value={location.address} onChange={(address) => onChange({ ...location, address })} />
            <div className="grid grid-cols-2 gap-3">
                <Field label="Latitude" type="number" step="any" value={location.latitude} onChange={(v) => onChange({ ...location, latitude: Number(v) })} />
                <Field label="Longitude" type="number" step="any" value={location.longitude} onChange={(v) => onChange({ ...location, longitude: Number(v) })} />
            </div>
        </div>
    )
}
