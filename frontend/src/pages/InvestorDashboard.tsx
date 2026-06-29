import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/client';
import { BrowseByArea } from '../components/investor/BrowseByArea';
import { PredictInvestment } from '../components/investor/PredictInvestment';
import { AppLayout } from '../components/layout/AppLayout';
import { PropertyCard } from '../components/PropertyCard';
import { EmptyState } from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/Loading';
import * as propertyService from '../services/propertyService';
import type { Property } from '../types';
import { useAuthStore } from '../store/authStore';

export function InvestorDashboard() {
  const { user } = useAuthStore();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [favLoading, setFavLoading] = useState(true);

  useEffect(() => {
    propertyService
      .getFavorites()
      .then((favs) => setFavoriteIds(new Set(favs.map((f) => f.id))))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setFavLoading(false));
  }, []);

  const toggleFavorite = async (id: number) => {
    try {
      if (favoriteIds.has(id)) {
        await propertyService.removeFavorite(id);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        toast.success('Removed from favorites');
      } else {
        await propertyService.addFavorite(id);
        setFavoriteIds((prev) => new Set(prev).add(id));
        toast.success('Added to favorites');
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (favLoading) {
    return (
      <AppLayout>
        <PageLoader />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-container space-y-8">
        <div>
          <p className="text-sm font-medium text-primary-600">
            Welcome back, <span className="font-semibold text-surface-900">{user?.full_name}</span>
          </p>
          <h1 className="font-display text-2xl font-bold text-surface-900 sm:text-3xl">Investor Dashboard</h1>
          <p className="mt-2 max-w-2xl text-surface-800/60">
            Browse historical stats and get ML price estimates — each section uses separate data sources.
          </p>
        </div>

        <BrowseByArea favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />

        <PredictInvestment />
      </div>
    </AppLayout>
  );
}

export function InvestorFavoritesPage() {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertyService
      .getFavorites()
      .then(setFavorites)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="page-container">
        <h1 className="font-display text-2xl font-bold text-surface-900">Saved Favorites</h1>
        {loading ? (
          <PageLoader />
        ) : favorites.length === 0 ? (
          <EmptyState
            title="No favorites yet"
            description="Save properties from Browse by Area results to track them here."
          />
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
