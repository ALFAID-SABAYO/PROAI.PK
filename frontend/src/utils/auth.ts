import type { UserRole } from '../types';

export function getDashboardPath(role: UserRole): string {
  const paths: Record<UserRole, string> = {
    admin: '/admin',
    investor: '/investor',
    agent: '/agent',
  };
  return paths[role];
}
