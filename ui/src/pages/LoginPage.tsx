import { useState, type FormEvent } from 'react';
import { ArrowRight, CircleHelp } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { taxiApi, errorMessage } from '../functions';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/ui/Alert';
import { Field } from '../components/ui/Field';

export function LoginPage() {
    const { session, signIn } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    if (session) return <Navigate to={session.user.role === 'DRIVER' ? '/driver' : '/passenger'} replace />;
    
    async function submit(event: FormEvent) {
        event.preventDefault(); setBusy(true); setError('');
        try {
            const result = await taxiApi.login(email, password);
            signIn(result);
            navigate(result.user.role === 'DRIVER' ? '/driver' : '/passenger', { replace: true });
        } catch (err) { setError(errorMessage(err)); }
        finally { setBusy(false); }
    }

    return <>
        <div className="mb-8"><p className="mb-2 text-sm font-semibold text-blue-600">WELCOME TO TAXI.RIO</p><h1 className="text-3xl font-bold tracking-tight text-slate-900">Sign in to your account</h1><p className="mt-2 text-slate-500">Enter your credentials to continue.</p></div>
        {location.state && <div className="mb-4"><Alert tone="success" text="Account created. You can sign in now." /></div>}
        <form onSubmit={submit} className="space-y-4"><Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" /><Field label="Password" type="password" value={password} onChange={setPassword} />{error && <Alert text={error} />}<button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700">{busy ? 'Signing in...' : 'Sign in'}<ArrowRight size={17} /></button></form>
        <p className="mt-6 text-center text-sm text-slate-500">New to Taxi.Rio? <Link to="/register" className="font-semibold text-blue-600 hover:underline">Create an account</Link></p>
        <p className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-slate-400"><CircleHelp size={14} /> Driver accounts are provisioned by the administrator.</p>
    </>;
}
