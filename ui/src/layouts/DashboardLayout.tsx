import { CarFront, Compass, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function DashboardLayout() {
    const { session, signOut } = useAuth();
    const navigate = useNavigate();
    const passenger = session?.user.role === 'PASSENGER';
    const signOutAndRedirect = () => { signOut(); navigate('/login', { replace: true }); };

    return (
        <div className="min-h-screen bg-[#f7f9fc] lg:flex">
            <aside className="hidden w-64 shrink-0 flex-col bg-[#102a50] px-5 py-7 text-white lg:flex">
                <div className="mb-14 flex items-center gap-3 px-2"><div className="grid size-10 place-items-center rounded-xl bg-blue-500"><CarFront size={23} /></div><span className="text-xl font-bold">Taxi<span className="text-sky-400">.Rio</span></span></div>
                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-blue-200/50">Workspace</p>
                <NavLink to={passenger ? '/passenger' : '/driver'} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${isActive ? 'bg-blue-500/25 text-white' : 'text-blue-100/70 hover:bg-white/10'}`}><Compass size={18} /> Dashboard</NavLink>
                <div className="mt-auto space-y-5"><div className="rounded-xl border border-white/10 bg-white/5 p-4"><p className="flex items-center gap-2 text-sm"><ShieldCheck size={17} className="text-emerald-400" /> Connected API</p><p className="mt-2 text-xs leading-5 text-blue-100/60">Live data from your NestJS backend.</p></div><button onClick={signOutAndRedirect} className="flex items-center gap-3 px-3 py-3 text-sm text-blue-100/70 hover:text-white"><LogOut size={18} /> Sign out</button></div>
            </aside>
            <div className="min-w-0 flex-1"><header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-9"><div className="flex items-center gap-2 lg:hidden"><CarFront className="text-blue-600" /><span className="font-bold">Taxi.Rio</span></div><p className="hidden text-sm text-slate-500 lg:block">Ride management / Dashboard</p><div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-semibold text-slate-800">{session?.user.name}</p><p className="text-xs text-slate-400">{passenger ? 'Passenger' : 'Driver'}</p></div><div className="grid size-10 place-items-center rounded-full bg-blue-100 text-blue-700"><UserRound size={19} /></div><button title="Sign out" onClick={signOutAndRedirect} className="ml-2 text-slate-500 lg:hidden"><LogOut size={19} /></button></div></header>
                <main className="mx-auto max-w-6xl space-y-6 px-5 py-8 sm:px-9"><Outlet /><footer className="border-t border-slate-200 pt-6 text-xs text-slate-400">Taxi.Rio technical challenge · React + Tailwind CSS</footer></main>
            </div>
        </div>
    )
}
