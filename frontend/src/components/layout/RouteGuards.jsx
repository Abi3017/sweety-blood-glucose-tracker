import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../common/States';

/** Only for logged-in users; otherwise redirect to /login and come back afterwards. */
export function ProtectedRoute() {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();
  if (initializing) return <LoadingState label="Checking your session…" />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

/** Login / register pages: logged-in users go straight to the dashboard. */
export function PublicOnlyRoute() {
  const { isAuthenticated, initializing } = useAuth();
  if (initializing) return <LoadingState label="Checking your session…" />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
