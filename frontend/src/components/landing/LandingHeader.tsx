import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getDashboardPath } from '../../utils/auth';

export function LandingHeader() {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2 font-display text-xl font-bold sm:text-2xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all duration-300 group-hover:scale-105">
            P
          </span>
          <span className="text-white transition group-hover:text-indigo-200">
            PropAI<span className="text-violet-400">.pk</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm text-slate-400 transition-all duration-300 hover:text-white">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-slate-400 transition-all duration-300 hover:text-white">
            How it works
          </a>
          <a href="#cities" className="text-sm text-slate-400 transition-all duration-300 hover:text-white">
            Cities
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-white/70 sm:block">Hi, {user.full_name}</span>
              <Link to={getDashboardPath(user.role)} className="btn-cyber-sm">
                Dashboard
              </Link>
              <button
                onClick={() => logout()}
                className="rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 sm:px-4"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-lg px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white sm:block"
              >
                Sign in
              </Link>
              <Link to="/register" className="btn-cyber-sm">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
