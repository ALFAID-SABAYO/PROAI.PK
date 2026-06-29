import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/client';
import { AppLayout } from '../components/layout/AppLayout';
import { EmptyState } from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/Loading';
import * as analyticsService from '../services/analyticsService';
import * as propertyService from '../services/propertyService';
import type { AgentAnalytics, Property } from '../types';
import { formatPKR } from '../utils/format';

export function AgentDashboard() {
  const [listings, setListings] = useState<Property[]>([]);
  const [analytics, setAnalytics] = useState<AgentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([propertyService.getMyListings(), analyticsService.getAgentAnalytics()])
      .then(([props, stats]) => {
        setListings(props);
        setAnalytics(stats);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Deactivate this listing?')) return;
    try {
      await propertyService.deleteProperty(id);
      setListings((prev) => prev.filter((p) => p.id !== id));
      toast.success('Listing deactivated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <PageLoader />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-container">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-surface-900">Agent Dashboard</h1>
            <p className="text-surface-800/60">Manage your property listings</p>
          </div>
          <Link
            to="/agent/new"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            + Add Listing
          </Link>
        </div>

        {analytics && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: 'Total Listings', value: analytics.total_listings },
              { label: 'Active', value: analytics.active_listings },
              { label: 'Avg Price', value: formatPKR(analytics.avg_listed_price) },
            ].map((s) => (
              <div key={s.label} className="card p-5">
                <p className="text-sm text-surface-800/60">{s.label}</p>
                <p className="mt-1 font-display text-2xl font-bold text-primary-700">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          {listings.length === 0 ? (
            <EmptyState
              title="No listings yet"
              description="Add your first property listing to get started."
              action={
                <Link to="/agent/new" className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white">
                  Add Listing
                </Link>
              }
            />
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-surface-100 text-left">
                    <tr>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((p) => (
                      <tr key={p.id} className="border-t border-surface-200">
                        <td className="px-4 py-3">
                          {p.location}, {p.city}
                        </td>
                        <td className="px-4 py-3">{p.property_type}</td>
                        <td className="px-4 py-3">{formatPKR(p.price)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              p.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {p.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/agent/edit/${p.id}`} className="text-primary-600 hover:underline">
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="ml-3 text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
