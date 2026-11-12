import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';

export function ProtectedRoute({ role }: { role?: Role }) {
  const { session, checking } = useAuth();

  if (checking) return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Restoring session...</div>;
  if (!session) return <Navigate to="/login" replace/>;
  if (role && session.user.role !== role) return <Navigate to={session.user.role === 'DRIVER' ? '/driver' : '/passenger'} replace/>;
  
  return <Outlet/>;
}
