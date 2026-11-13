import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, CarFront, Navigation2, Plus, RefreshCw, Route } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage, LAST_RIDE_KEY, PENDING_RIDE_KEY, taxiApi } from '../functions';
import type { Location, Ride } from '../types';
import { Alert } from '../components/ui/Alert';
import { Panel } from '../components/ui/Panel';
import { LocationFields } from '../components/rides/LocationFields';
import { RideDetails } from '../components/rides/RideDetails';

const DEFAULT_ORIGIN: Location = { address: 'Avenida Paulista, 1000', latitude: -23.5614, longitude: -46.6559 };
const DEFAULT_DESTINATION: Location = { address: 'Parque Ibirapuera', latitude: -23.5874, longitude: -46.6576 };
interface PendingRide { key: string; signature: string; }

function loadPending(): PendingRide | null {
    try { return JSON.parse(sessionStorage.getItem(PENDING_RIDE_KEY) || 'null') as PendingRide | null; }
    catch { return null; }
}

function Summary({ title, value }: { title: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-500">{title}</p><p className="mt-5 break-words text-xl font-bold text-slate-900">
                {value}
            </p>
        </div>
    )
}

export function PassengerPage() {
    const { session } = useAuth();

    const token = session!.accessToken;

    const [origin, setOrigin] = useState<Location>(DEFAULT_ORIGIN);
    const [destination, setDestination] = useState<Location>(DEFAULT_DESTINATION);
    const [rideId, setRideId] = useState(() => sessionStorage.getItem(LAST_RIDE_KEY) ?? '');
    const [ride, setRide] = useState<Ride | null>(null);
    const [pending, setPending] = useState<PendingRide | null>(loadPending);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    useEffect(() => {
        const previousId = sessionStorage.getItem(LAST_RIDE_KEY) ?? "";
        if (!previousId) return;
        let active = true;
        taxiApi.getRide(token, previousId).then((result) => { if (active) setRide(result); }).catch(() => { });
        return () => { active = false; };
    }, [token]);

    async function create(event: FormEvent) {
        event.preventDefault(); 
        setError(''); 
        setNotice('');

        const signature = JSON.stringify({ origin, destination });
        
        if (pending && pending.signature !== signature) {
            setError('Ride details changed after an attempt. Reset the retry key to start a new operation.'); return;
        }

        const attempt = pending ?? { key: crypto.randomUUID(), signature };
        if (!pending) { sessionStorage.setItem(PENDING_RIDE_KEY, JSON.stringify(attempt)); setPending(attempt); }
        setBusy(true);

        try {
            const created = await taxiApi.createRide(token, origin, destination, attempt.key);
            setRide(created); setRideId(created.id); sessionStorage.setItem(LAST_RIDE_KEY, created.id);
            sessionStorage.removeItem(PENDING_RIDE_KEY); setPending(null); setNotice('Ride requested successfully.');
        } catch (err) { setError(errorMessage(err)); }
        finally { setBusy(false); }
    }

    async function lookup(event: FormEvent) {
        event.preventDefault(); setBusy(true); setError(''); setNotice('');
        try { const found = await taxiApi.getRide(token, rideId.trim()); setRide(found); sessionStorage.setItem(LAST_RIDE_KEY, found.id); setNotice('Ride refreshed.'); }
        catch (err) { setError(errorMessage(err)); }
        finally { setBusy(false); }
    }

    function resetKey() { 
        sessionStorage.removeItem(PENDING_RIDE_KEY); 
        setPending(null); 
        setError(''); 
        setNotice('Ready for a new booking attempt.'); 
    }

    return <>
        <div><p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-600">TAXI.RIO / PASSENGER</p><h1 className="text-3xl font-bold tracking-tight text-[#162745]">Your next journey</h1><p className="mt-2 text-sm text-slate-500">Plan a trip and follow its progress.</p></div>
        <div className="grid gap-4 sm:grid-cols-3"><Summary title="Your role" value="Passenger" /><Summary title="Current ride" value={ride?.status ?? 'None selected'} /><Summary title="API" value="Connected via /api" /></div>
        {error && <Alert text={error} />} {notice && <Alert text={notice} tone="success" />}
        <div className="grid items-start gap-6 xl:grid-cols-[1.1fr_.9fr]">
            <Panel title="Request a ride" detail="Enter pickup and destination details" action={<span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">New booking</span>}>
                <form className="space-y-4" onSubmit={create}>
                    <LocationFields label="Pickup location" location={origin} onChange={setOrigin} />
                    <div className="flex justify-center"><Navigation2 className="text-slate-400" size={19} /></div>
                    <LocationFields label="Destination" location={destination} onChange={setDestination} />
                    <button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700"><CarFront size={18} />{busy ? 'Processing...' : 'Request ride'}<ArrowRight size={17} /></button>
                    <button type="button" onClick={resetKey} className="flex w-full items-center justify-center gap-2 text-xs font-medium text-slate-500 hover:text-blue-600"><Plus size={14} /> New attempt / reset retry key</button>
                    <p className="text-xs leading-5 text-slate-400">A failed network request keeps its idempotency key for safe retries.</p>
                </form>
            </Panel>
            <div className="space-y-6">
                <Panel title="Find a ride" detail="Look up one of your rides by ID"><form className="flex gap-2" onSubmit={lookup}><input required value={rideId} onChange={(event) => setRideId(event.target.value)} placeholder="Paste ride ID" className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm" /><button disabled={busy} aria-label="Refresh ride" className="grid h-11 w-12 shrink-0 place-items-center rounded-xl bg-[#102a50] text-white"><RefreshCw size={18} /></button></form></Panel>
                <Panel title="Ride details" detail="Latest response from MySQL"><>{ride ? <><RideDetails ride={ride} /><Link to={`/rides/${ride.id}`} className="mt-5 inline-block text-sm font-semibold text-blue-600 hover:underline">View ride page</Link></> : <div className="flex flex-col items-center py-10 text-center text-slate-400"><Route size={32} /><p className="mt-3 text-sm">No ride selected</p></div>}</></Panel>
            </div>
        </div>
    </>;
}
