import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { taxiApi, LAST_RIDE_KEY, PENDING_RIDE_KEY } from '../functions';
import type { Session } from '../types';

const SESSION_KEY = 'taxirio_demo_session';
interface AuthContextValue {
    session: Session | null;
    checking: boolean;
    signIn: (session: Session) => void;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
function readSession(): Session | null {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null') as Session | null; }
    catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(readSession);
    const [checking, setChecking] = useState(() => !!readSession());

    useEffect(() => {
        const saved = readSession();
        if (!saved) { setChecking(false); return; }
        let mounted = true;
        taxiApi.me(saved.accessToken)
            .then((user) => {
                if (!mounted) return;
                setSession({ ...saved, user });
                sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...saved, user }));
            })
            .catch(() => {
                if (!mounted) return;
                sessionStorage.removeItem(SESSION_KEY);
                setSession(null);
            })
            .finally(() => { if (mounted) setChecking(false); });
        return () => { mounted = false; };
    }, []);

    const signIn = (next: Session) => {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
        sessionStorage.removeItem(LAST_RIDE_KEY);
        sessionStorage.removeItem(PENDING_RIDE_KEY);
        setSession(next);
        setChecking(false);
    };

    const signOut = () => {
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(LAST_RIDE_KEY);
        sessionStorage.removeItem(PENDING_RIDE_KEY);
        setSession(null);
    };

    return <AuthContext.Provider value={{ session, checking, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be called inside AuthProvider');
    return context;
}
