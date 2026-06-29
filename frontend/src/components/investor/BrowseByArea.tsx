import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../api/client';
import { PropertyCard } from '../PropertyCard';
import { DualRangeSlider } from '../ui/DualRangeSlider';
import { EmptyState } from '../ui/EmptyState';
import { PropertyCardSkeleton } from '../ui/Loading';
import * as propertyService from '../../services/propertyService';
import * as statsService from '../../services/statsService';
import type { AreaOption, AreaPriceStats } from '../../services/statsService';
import type { Property } from '../../types';
import { formatPKR } from '../../utils/format';

interface BrowseByAreaProps {
  favoriteIds: Set<number>;
  onToggleFavorite: (id: number) => void;
  onAreaSelected?: () => void;
}

function areaKey(area: AreaOption) {
  return `${area.location}|||${area.city}`;
}

export function BrowseByArea({ favoriteIds, onToggleFavorite, onAreaSelected }: BrowseByAreaProps) {
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [areasLoading, setAreasLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState('');
  const [stats, setStats] = useState<AreaPriceStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const selectedArea = areas.find((a) => areaKey(a) === selectedKey) ?? null;

  useEffect(() => {
    statsService
      .getAreas()
      .then(setAreas)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setAreasLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedArea) {
      setStats(null);
      setProperties([]);
      return;
    }

    setStatsLoading(true);
    statsService
      .getAreaPriceStats(selectedArea.location, selectedArea.city)
      .then((data) => {
        setStats(data);
        setPriceRange([data.min_price, data.max_price]);
        setPage(1);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setStatsLoading(false));
  }, [selectedArea?.location, selectedArea?.city]);

  const loadProperties = useCallback(async () => {
    if (!selectedArea || !stats) return;
    setListLoading(true);
    try {
      const result = await propertyService.searchProperties({
        location: selectedArea.location,
        city: selectedArea.city,
        location_exact: true,
        min_price: priceRange[0],
        max_price: priceRange[1],
        page,
        page_size: 12,
      });
      setProperties(result.items);
      setTotalPages(result.total_pages);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setListLoading(false);
    }
  }, [selectedArea, stats, priceRange, page]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  return (
    <section className="card border-l-4 border-l-primary-500 p-6">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary-600">
        Statistics · Historical data
      </div>
      <h2 className="font-display text-xl font-bold text-surface-900">Browse by Area</h2>
      <p className="mt-1 text-sm text-surface-800/60">
        Filter listings by neighborhood using real min/max prices from the database.
      </p>

      <div className="mt-6">
        <label className="text-sm font-medium text-surface-800">Area</label>
        <select
          value={selectedKey}
          onChange={(e) => {
            setSelectedKey(e.target.value);
            if (e.target.value) onAreaSelected?.();
          }}
          disabled={areasLoading}
          className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        >
          <option value="">
            {areasLoading ? 'Loading areas…' : 'Select an area…'}
          </option>
          {areas.map((a) => (
            <option key={areaKey(a)} value={areaKey(a)}>
              {a.location} — {a.city} ({a.listing_count} listings)
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {!selectedArea ? (
          <div className="rounded-lg bg-surface-100 px-4 py-8 text-center text-sm text-surface-800/50">
            Please select an area first.
          </div>
        ) : statsLoading ? (
          <div className="h-24 animate-pulse rounded-lg bg-surface-100" />
        ) : stats ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-surface-800">Price range (PKR)</p>
              <p className="rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700">
                Average: {formatPKR(stats.avg_price)}
              </p>
            </div>
            <div className="mt-4 px-1">
              <DualRangeSlider
                min={stats.min_price}
                max={stats.max_price}
                value={priceRange}
                onChange={(v) => {
                  setPriceRange(v);
                  setPage(1);
                }}
                formatLabel={formatPKR}
              />
            </div>

            {stats.bedroom_breakdown.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-surface-800/50">
                  Avg price by bedrooms
                </p>
                <div className="flex flex-wrap gap-2">
                  {stats.bedroom_breakdown.map((b) => (
                    <span
                      key={b.bedrooms}
                      className="rounded-full border border-surface-200 bg-surface-50 px-3 py-1 text-xs text-surface-800"
                    >
                      {b.bedrooms} Bed: {formatPKR(b.avg_price)}
                      <span className="ml-1 text-surface-800/40">({b.listing_count})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {selectedArea && stats && (
        <div className="mt-8">
          <h3 className="mb-4 text-sm font-semibold text-surface-800">
            Listings in {selectedArea.location} ({formatPKR(priceRange[0])} – {formatPKR(priceRange[1])})
          </h3>
          {listLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <EmptyState
              title="No properties in this range"
              description="Try widening the price slider for this area."
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((p) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    showFavorite
                    isFavorite={favoriteIds.has(p.id)}
                    onToggleFavorite={() => onToggleFavorite(p.id)}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-surface-800/60">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
