import { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage, taxiApi } from '../functions';
import type { Ride } from '../types';
import { Alert } from '../components/ui/Alert';
import { Panel } from '../components/ui/Panel';
import { RideDetails } from '../components/rides/RideDetails';

export function RidePage() {
    const { id } = useParams<{ id: string }>();
    const { session } = useAuth();
    const [ride, setRide] = useState<Ride | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    async function refresh(rideId: string, token: string) {
        setLoading(true); setError('');
        try { setRide(await taxiApi.getRide(token, rideId)); }
        catch (err) { setError(errorMessage(err)); }
        finally { setLoading(false); }
    }

    useEffect(() => {
        if (id && session) void refresh(id, session.accessToken);
    }, [id, session]);

    return <>
        <Link to="/passenger" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600"><ArrowLeft size={17} /> Back to dashboard</Link>
        <div><p className="text-xs font-bold uppercase tracking-widest text-blue-600">PASSENGER / RIDE</p><h1 className="mt-1 text-3xl font-bold text-[#162745]">Ride details</h1></div>
        {error && <Alert text={error} />}
        <Panel title="Tracking" detail="Refresh to fetch the current status from MySQL" action={<button disabled={loading || !id || !session} onClick={() => id && session && void refresh(id, session.accessToken)} className="flex items-center gap-2 text-sm font-semibold text-blue-600"><RefreshCw size={17} /> Refresh</button>}>
            {ride ? <RideDetails ride={ride} /> : <p className="py-10 text-center text-sm text-slate-400">{loading ? 'Loading ride...' : 'No ride details available.'}</p>}
        </Panel>
    </>;
}
