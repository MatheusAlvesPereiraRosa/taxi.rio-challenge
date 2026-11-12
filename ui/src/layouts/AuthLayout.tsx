import { CarFront, Clock3, Route, ShieldCheck } from 'lucide-react';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
    return (
        <div className="min-h-screen bg-[#f5f8fc] lg:grid lg:grid-cols-2">
            <aside className="hidden flex-col justify-between bg-[#0c254a] p-14 text-white lg:flex">
                <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl bg-blue-500"><CarFront size={25} /></div><span className="text-xl font-bold">Taxi<span className="text-sky-400">.Rio</span></span></div>
                <div className="max-w-lg"><p className="mb-5 text-sm font-medium text-sky-300">Ride management, simplified</p>
                    <h1 className="text-5xl font-bold leading-tight tracking-tight">Your city.<br /><span className="text-sky-400">Your next ride.</span></h1>
                    <p className="mt-6 max-w-md text-lg leading-8 text-blue-100/70">Request a ride and follow its journey from pickup to destination.</p>
                    <div className="mt-14 grid grid-cols-3 gap-4 border-t border-white/15 pt-7 text-sm text-blue-100/70"><span><ShieldCheck className="mb-3 text-sky-400" />Secure access</span><span><Route className="mb-3 text-sky-400" />Ride tracking</span><span><Clock3 className="mb-3 text-sky-400" />Fast booking</span></div>
                </div><p className="text-sm text-blue-100/50">Taxi.Rio · Technical challenge</p>
            </aside>
            <main className="flex min-h-screen items-center justify-center px-5 py-12"><div className="w-full max-w-md"><div className="mb-10 flex items-center gap-3 lg:hidden"><CarFront className="text-blue-600" /><span className="text-xl font-bold">Taxi<span className="text-blue-600">.Rio</span></span></div><Outlet /></div></main>
        </div>
    )
}
