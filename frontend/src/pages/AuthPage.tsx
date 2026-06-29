import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/client';
import { CyberBackground } from '../components/cyber/CyberBackground';
import { CitySkyline } from '../components/landing/CitySkyline';
import { LoadingSpinner } from '../components/ui/Loading';
import { useAuthStore } from '../store/authStore';
import { getDashboardPath } from '../utils/auth';

type RegisterRole = 'investor' | 'agent';
type Mode = 'login' | 'register';

export function AuthPage({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<RegisterRole>('investor');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.includes('@')) e.email = 'Enter a valid email';
    if (mode === 'register') {
      if (password.length < 8) e.password = 'Password must be at least 8 characters';
      else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
        e.password = 'Password must contain at least one letter and one number';
      }
    } else if (password.length < 1) {
      e.password = 'Enter your password';
    }
    if (mode === 'register' && fullName.length < 2) e.fullName = 'Enter your full name';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success('Welcome back!');
      } else {
        await register({ email, password, full_name: fullName, role });
        toast.success('Account created successfully!');
      }
      const user = useAuthStore.getState().user;
      navigate(user ? getDashboardPath(user.role) : '/');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="relative flex min-h-screen">
      <CyberBackground />

      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-10 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold">
            P
          </span>
          PropAI<span className="text-violet-400">.pk</span>
        </Link>

        <div>
          <h2 className="font-display text-3xl font-bold leading-tight">
            Access your <span className="gradient-text">cyber workspace</span>
          </h2>
          <p className="mt-4 max-w-md text-slate-400">
            Investor, agent, and admin dashboards share one unified dark interface.
          </p>
          <div className="mt-8">
            <CitySkyline variant="compact" className="h-36 opacity-90" />
          </div>
        </div>

        <p className="text-sm text-slate-600">© PropAI.pk — Pakistan real estate intelligence</p>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="cyber-glass w-full max-w-md p-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-xl font-bold text-white lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold">
              P
            </span>
            PropAI<span className="text-violet-400">.pk</span>
          </Link>

          <h1 className="mt-6 font-display text-2xl font-bold text-white">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <Link
              to={mode === 'login' ? '/register' : '/login'}
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              {mode === 'login' ? 'Register' : 'Sign in'}
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Full name</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" />
                  {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">I am registering as</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as RegisterRole)}
                    className="input-field"
                  >
                    <option value="investor">Investor</option>
                    <option value="agent">Agent (property lister)</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>
            <button type="submit" disabled={isLoading} className="btn-cyber flex w-full gap-2 py-2.5">
              {isLoading && <LoadingSpinner size="sm" />}
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {mode === 'login' && import.meta.env.DEV && (
            <div className="mt-6 rounded-xl border border-slate-800/60 bg-slate-950/50 p-4 text-xs text-slate-500">
              <p className="font-medium text-slate-400">Demo accounts (dev only)</p>
              <p className="mt-1">investor@realestate.pk / investor123</p>
              <p>agent@realestate.pk / agent123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
