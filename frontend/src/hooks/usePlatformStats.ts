import { useEffect, useMemo, useState } from 'react';
import * as statsService from '../services/statsService';
import {
  buildPlatformDataset,
  deriveHeroMetrics,
  type PlatformDataRow,
  type PlatformStats,
} from '../types/platform';

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    statsService
      .getPlatformStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load stats');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dataset: PlatformDataRow[] = useMemo(
    () => (stats ? buildPlatformDataset(stats) : []),
    [stats],
  );

  const metrics = useMemo(() => deriveHeroMetrics(dataset), [dataset]);

  return { stats, dataset, metrics, loading, error };
}
