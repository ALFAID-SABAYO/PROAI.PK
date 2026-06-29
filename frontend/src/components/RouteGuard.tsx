import { Navigate } from 'react-router-dom';
import { PageLoader } from './ui/Loading';
import { useAuthStore } from '../store/authStore';
import { getDashboardPath } from '../utils/auth';
import type { UserRole } from '../types';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { user, token, isLoading } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading || (token && !user)) {
    return <PageLoader />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
}
