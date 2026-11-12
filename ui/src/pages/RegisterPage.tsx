import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { taxiApi, errorMessage } from '../functions';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/ui/Alert';
import { Field } from '../components/ui/Field';

export function RegisterPage() {
    const { session } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    if (session) return <Navigate to={session.user.role === 'DRIVER' ? '/driver' : '/passenger'} replace />;
    async function submit(event: FormEvent) {
        event.preventDefault(); setBusy(true); setError('');
        try { await taxiApi.register(name, email, password); navigate('/login', { replace: true, state: { registered: true } }); }
        catch (err) { setError(errorMessage(err)); }
        finally { setBusy(false); }
    }

    return <>
        <div className="mb-8"><p className="mb-2 text-sm font-semibold text-blue-600">GET STARTED</p><h1 className="text-3xl font-bold tracking-tight text-slate-900">Create an account</h1><p className="mt-2 text-slate-500">Register as a passenger and request your first ride.</p></div>
        <form onSubmit={submit} className="space-y-4"><Field label="Full name" value={name} onChange={setName} placeholder="Your name" /><Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" /><Field label="Password (12+ characters)" type="password" minLength={12} value={password} onChange={setPassword} />{error && <Alert text={error} />}<button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700">{busy ? 'Creating...' : 'Create account'}<ArrowRight size={17} /></button></form>
        <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:underline">Sign in</Link></p>
    </>;
}
