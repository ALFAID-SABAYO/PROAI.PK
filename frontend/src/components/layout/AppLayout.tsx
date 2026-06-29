import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';

const navByRole: Record<UserRole, { label: string; path: string }[]> = {
  investor: [
    { label: 'Dashboard', path: '/investor' },
    { label: 'Analytics', path: '/investor/analytics' },
    { label: 'Favorites', path: '/investor/favorites' },
  ],
  agent: [
    { label: 'My Listings', path: '/agent' },
    { label: 'Add Listing', path: '/agent/new' },
  ],
  admin: [
    { label: 'Overview', path: '/admin' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Dataset', path: '/admin/dataset' },
  ],
};

const roleBadge: Record<UserRole, string> = {
  investor: 'bg-primary-100 text-primary-700',
  agent: 'bg-accent-500/15 text-accent-600',
  admin: 'bg-amber-100 text-amber-700',
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return <>{children}</>;

  const links = navByRole[user.role] || [];

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-50 to-surface-100/80">
      <header className="sticky top-0 z-50 border-b border-surface-200/80 bg-white/90 shadow-sm shadow-surface-200/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="group flex items-center gap-2 font-display text-xl font-bold text-primary-700"
            title="Home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-xs font-bold text-white transition group-hover:scale-105">
              P
            </span>
            PropAI<span className="text-accent-500">.pk</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-surface-800/70 hover:bg-surface-100 hover:text-surface-900'
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-4/5 -translate-x-1/2 rounded-full bg-primary-500" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-surface-900">{user.full_name}</p>
              <span
                className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${roleBadge[user.role]}`}
              >
                {user.role}
              </span>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="hidden rounded-lg border border-surface-200 px-3 py-1.5 text-sm font-medium text-surface-800/70 transition hover:bg-surface-100 sm:block"
            >
              Logout
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="rounded-lg p-2 text-surface-800 md:hidden"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t border-surface-200 bg-white px-4 py-3 md:hidden">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive(link.path) ? 'bg-primary-50 text-primary-700' : 'text-surface-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="mt-2 w-full rounded-lg border border-surface-200 px-3 py-2.5 text-left text-sm font-medium text-surface-800"
            >
              Logout
            </button>
          </nav>
        )}
      </header>
      <main>{children}</main>
    </div>
  );
}
