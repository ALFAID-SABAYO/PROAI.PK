import { Navigate } from 'react-router-dom';
import { PageLoader } from './ui/Loading';
import { useAuthStore } from '../store/authStore';
import { getDashboardPath } from '../utils/auth';

/** Redirect authenticated users away from login/register to their dashboard. */
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading } = useAuthStore();

  if (token && (isLoading || !user)) {
    return <PageLoader />;
  }

  if (user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
}
