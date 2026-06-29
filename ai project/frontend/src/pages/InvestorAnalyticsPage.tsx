import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getErrorMessage } from '../api/client';
import { AppLayout } from '../components/layout/AppLayout';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Loading';
import * as statsService from '../services/statsService';
import type { CityAreaBreakdown, CityPropertyCount } from '../services/statsService';
import { formatPKR } from '../utils/format';

const CITY_COLORS = ['#3388ff', '#10b981', '#f59e0b', '#8b5cf6'];

export function InvestorAnalyticsPage() {
  const [cityCounts, setCityCounts] = useState<CityPropertyCount[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [areaData, setAreaData] = useState<CityAreaBreakdown[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [areasLoading, setAreasLoading] = useState(false);

  useEffect(() => {
    statsService
      .getCityPropertyCounts()
      .then((data) => {
        const filtered = data.filter((c) =>
          ['karachi', 'islamabad'].includes(c.city.toLowerCase()),
        );
        setCityCounts(filtered.length ? filtered : data);
        if (filtered.length) setSelectedCity(filtered[0].city);
        else if (data.length) setSelectedCity(data[0].city);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setCitiesLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCity) return;
    setAreasLoading(true);
    statsService
      .getCityAreaBreakdown(selectedCity, 15)
      .then(setAreaData)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setAreasLoading(false));
  }, [selectedCity]);

  const chartData = areaData.map((d) => ({
    name: d.location.length > 14 ? `${d.location.slice(0, 12)}…` : d.location,
    fullName: d.location,
    listings: d.listing_count,
    avgPriceM: d.avg_price / 1_000_000,
  }));

  return (
    <AppLayout>
      <div className="page-container">
        <h1 className="font-display text-2xl font-bold text-surface-900">Market Analytics</h1>
        <p className="mt-1 text-surface-800/60">
          Compare cities and drill into area-level listing counts and average prices.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="card p-5">
            <h2 className="font-display font-semibold text-surface-900">Properties per City</h2>
            <p className="text-xs text-surface-800/50">Click a city to drill down</p>
            {citiesLoading ? (
              <Skeleton className="mt-4 h-64 w-full" />
            ) : cityCounts.length === 0 ? (
              <EmptyState title="No city data" description="Seed the database to see analytics." />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={cityCounts}
                    dataKey="property_count"
                    nameKey="city"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    onClick={(_, index) => setSelectedCity(cityCounts[index].city)}
                    className="cursor-pointer"
                  >
                    {cityCounts.map((entry, i) => (
                      <Cell
                        key={entry.city}
                        fill={CITY_COLORS[i % CITY_COLORS.length]}
                        opacity={selectedCity === entry.city ? 1 : 0.55}
                        stroke={selectedCity === entry.city ? '#1a67f5' : 'transparent'}
                        strokeWidth={selectedCity === entry.city ? 2 : 0}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [Number(value).toLocaleString(), 'Listings']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
            {selectedCity && (
              <p className="mt-2 text-center text-sm font-medium text-primary-700">
                Selected: {selectedCity}
              </p>
            )}
          </div>

          <div className="card flex flex-wrap gap-2 p-5">
            <h2 className="w-full font-display font-semibold text-surface-900">Quick city select</h2>
            {cityCounts.map((c) => (
              <button
                key={c.city}
                onClick={() => setSelectedCity(c.city)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  selectedCity === c.city
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface-100 text-surface-800 hover:bg-surface-200'
                }`}
              >
                {c.city} ({c.property_count.toLocaleString()})
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 card p-5">
          <h2 className="font-display font-semibold text-surface-900">
            {selectedCity ? `${selectedCity} — Top Areas` : 'Area breakdown'}
          </h2>
          <p className="text-xs text-surface-800/50">
            Listings count (bars) and average price in millions PKR (line)
          </p>
          {areasLoading ? (
            <Skeleton className="mt-4 h-80 w-full" />
          ) : !selectedCity ? (
            <EmptyState title="Select a city" description="Choose Karachi or Islamabad above." />
          ) : chartData.length === 0 ? (
            <EmptyState title="No area data" description={`No listings found for ${selectedCity}.`} />
          ) : (
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart data={chartData} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tickFormatter={(v) => `${v}`} label={{ value: 'Listings', angle: -90, position: 'insideLeft' }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(v) => `${v}M`}
                  label={{ value: 'Avg PKR (M)', angle: 90, position: 'insideRight' }}
                />
                <Tooltip
                  formatter={(value, name) => {
                    const num = Number(value);
                    if (name === 'Avg Price (M PKR)') return [formatPKR(num * 1_000_000), name];
                    return [num, name];
                  }}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fullName ? String(payload[0].payload.fullName) : ''
                  }
                />
                <Legend />
                <Bar yAxisId="left" dataKey="listings" name="Listings" fill="#3388ff" radius={[4, 4, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgPriceM"
                  name="Avg Price (M PKR)"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
