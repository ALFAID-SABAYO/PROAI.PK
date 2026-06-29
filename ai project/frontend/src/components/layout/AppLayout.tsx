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

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return <>{children}</>;

  const links = navByRole[user.role] || [];

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="sticky top-0 z-50 border-b border-surface-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="font-display text-xl font-bold text-primary-700">
            PropAI<span className="text-accent-500">.pk</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-surface-800/70 hover:bg-surface-100 hover:text-surface-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-surface-900">{user.full_name}</p>
              <p className="text-xs capitalize text-surface-800/50">{user.role}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="rounded-lg border border-surface-200 px-3 py-1.5 text-sm font-medium text-surface-800/70 transition hover:bg-surface-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
