import { Navigate } from 'react-router-dom';
import { PageLoader } from './ui/Loading';
import { useAuthStore } from '../store/authStore';
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
    const dashboard: Record<UserRole, string> = {
      admin: '/admin',
      investor: '/investor',
      agent: '/agent',
    };
    return <Navigate to={dashboard[user.role]} replace />;
  }

  return <>{children}</>;
}
