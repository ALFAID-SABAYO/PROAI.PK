import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/client';
import { LoadingSpinner } from '../components/ui/Loading';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types';

type Mode = 'login' | 'register';

export function AuthPage({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('investor');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.includes('@')) e.email = 'Enter a valid email';
    if (password.length < 6) e.password = 'Password must be at least 6 characters';
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
      const paths: Record<UserRole, string> = {
        admin: '/admin',
        investor: '/investor',
        agent: '/agent',
      };
      navigate(user ? paths[user.role] : '/');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
      <div className="card w-full max-w-md p-8">
        <Link to="/" className="font-display text-xl font-bold text-primary-700">
          PropAI<span className="text-accent-500">.pk</span>
        </Link>
        <h1 className="mt-6 font-display text-2xl font-bold text-surface-900">
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </h1>
        <p className="mt-1 text-sm text-surface-800/60">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <Link
            to={mode === 'login' ? '/register' : '/login'}
            className="font-medium text-primary-600 hover:underline"
          >
            {mode === 'login' ? 'Register' : 'Sign in'}
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-surface-800">Full name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-800">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="investor">Investor</option>
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-surface-800">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-800">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
          >
            {isLoading && <LoadingSpinner size="sm" />}
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
