import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PassengerPage } from './pages/PassengerPage';
import { DriverPage } from './pages/DriverPage';
import { RidePage } from './pages/RidePage';
import { useAuth } from './context/AuthContext';

function HomeRedirect() {
    const { checking, session } = useAuth();
    if (checking) return <div className="grid min-h-screen place-items-center text-slate-500">Restoring session...</div>;
    return <Navigate to={!session ? '/login' : session.user.role === 'DRIVER' ? '/driver' : '/passenger'} replace />;
}

export default function App() {
    return <Routes>
        <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute role="PASSENGER" />}>
            <Route element={<DashboardLayout />}>
                <Route path="/passenger" element={<PassengerPage />} />
                <Route path="/rides/:id" element={<RidePage />} />
            </Route>
        </Route>
        <Route element={<ProtectedRoute role="DRIVER" />}>
            <Route element={<DashboardLayout />}>
                <Route path="/driver" element={<DriverPage />} />
            </Route>
        </Route>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
    </Routes>;
}
