import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/client';
import { AppLayout } from '../components/layout/AppLayout';
import { PageLoader } from '../components/ui/Loading';
import * as analyticsService from '../services/analyticsService';
import type { ModelMetrics, SystemAnalytics, User } from '../types';
import { formatNumber, formatPKR } from '../utils/format';

export function AdminDashboard() {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [metrics, setMetrics] = useState<ModelMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getSystemAnalytics(),
      analyticsService.getModelMetrics().catch(() => []),
    ])
      .then(([sys, m]) => {
        setAnalytics(sys);
        setMetrics(m);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout><PageLoader /></AppLayout>;

  return (
    <AppLayout>
      <div className="page-container">
        <h1 className="font-display text-2xl font-bold">Admin Overview</h1>
        <p className="text-surface-800/60">System-wide analytics and model performance</p>

        {analytics && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total Users', value: analytics.total_users },
              { label: 'Properties', value: formatNumber(analytics.total_properties) },
              { label: 'Agent Listings', value: analytics.total_listings_by_agents },
              { label: 'Cities', value: analytics.properties_by_city.length },
            ].map((s) => (
              <div key={s.label} className="card p-5">
                <p className="text-sm text-surface-800/60">{s.label}</p>
                <p className="mt-1 font-display text-2xl font-bold text-primary-700">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {metrics.length > 0 && (
          <div className="mt-8 card overflow-hidden">
            <h2 className="border-b border-surface-200 px-5 py-4 font-display font-semibold">
              ML Model Performance
            </h2>
            <table className="w-full text-sm">
              <thead className="bg-surface-100 text-left">
                <tr>
                  <th className="px-5 py-3">Model</th>
                  <th className="px-5 py-3">R²</th>
                  <th className="px-5 py-3">MAE</th>
                  <th className="px-5 py-3">RMSE</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.model_name} className="border-t border-surface-200">
                    <td className="px-5 py-3 capitalize">{m.model_name.replace('_', ' ')}</td>
                    <td className="px-5 py-3">{(m.r2 * 100).toFixed(1)}%</td>
                    <td className="px-5 py-3">{formatPKR(m.mae)}</td>
                    <td className="px-5 py-3">{formatPKR(m.rmse)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {analytics && analytics.properties_by_city.length > 0 && (
          <div className="mt-8 card p-5">
            <h2 className="mb-4 font-display font-semibold">Properties by City</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {analytics.properties_by_city.map((c) => (
                <div key={c.city} className="rounded-lg bg-surface-50 p-4">
                  <p className="font-medium">{c.city}</p>
                  <p className="text-sm text-surface-800/60">
                    {formatNumber(c.property_count)} properties · Avg {formatPKR(c.avg_price)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../services/userService')
      .then((m) => m.getUsers())
      .then(setUsers)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      const { updateUser } = await import('../services/userService');
      const updated = await updateUser(id, { is_active: !isActive });
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success('User updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <AppLayout>
      <div className="page-container">
        <h1 className="font-display text-2xl font-bold">User Management</h1>
        {loading ? (
          <PageLoader />
        ) : (
          <div className="mt-6 card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-100 text-left">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-surface-200">
                    <td className="px-4 py-3">{u.full_name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3 capitalize">{u.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          u.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(u.id, u.is_active)}
                        className="text-primary-600 hover:underline"
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export function AdminDatasetPage() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await analyticsService.uploadDataset(file);
      toast.success(result.message);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-container max-w-2xl">
        <h1 className="font-display text-2xl font-bold">Dataset Management</h1>
        <p className="mt-1 text-surface-800/60">
          Upload a new Zameen.com CSV, then re-run ML training and seed_db.py
        </p>
        <div className="card mt-6 p-8 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleUpload}
            disabled={uploading}
            className="mx-auto block text-sm"
          />
          {uploading && <p className="mt-4 text-sm text-surface-800/60">Uploading...</p>}
        </div>
        <div className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          <strong>After upload:</strong>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>Run <code>python -m app.ml.train</code> in /backend</li>
            <li>Run <code>python scripts/seed_db.py</code> to refresh Postgres data</li>
          </ol>
        </div>
      </div>
    </AppLayout>
  );
}
