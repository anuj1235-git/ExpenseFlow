import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Renders child routes only when the user is authenticated.
 *
 * Waits for the initial session-restore check (loading === true) before
 * deciding whether to redirect — prevents a false redirect to /login on
 * every page refresh while the JWT is being verified.
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Still resolving the JWT — show nothing (brief flash) rather than
  // incorrectly redirecting an authenticated user to /login.
  if (loading) {
    return (
      <div className="auth-loading">
        <span>Loading…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
