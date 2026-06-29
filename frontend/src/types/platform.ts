export interface CityRecord {
  city: string;
  property_count: number;
}

export interface PlatformStats {
  total_listings: number;
  total_cities: number;
  total_property_types: number;
  cities: CityRecord[];
  property_types: string[];
  best_model_name: string | null;
  best_model_r2: number | null;
  training_rows: number | null;
  avg_listing_price: number;
}

export type PlatformDataRow =
  | { kind: 'city'; city: string; property_count: number }
  | { kind: 'property_type'; name: string }
  | { kind: 'model'; name: string | null; r2: number | null; training_rows: number | null }
  | { kind: 'aggregate'; total_listings: number; avg_price: number };

export function buildPlatformDataset(stats: PlatformStats): PlatformDataRow[] {
  return [
    { kind: 'aggregate', total_listings: stats.total_listings, avg_price: stats.avg_listing_price },
    ...stats.cities.map((c) => ({ kind: 'city' as const, city: c.city, property_count: c.property_count })),
    ...stats.property_types.map((name) => ({ kind: 'property_type' as const, name })),
    {
      kind: 'model',
      name: stats.best_model_name,
      r2: stats.best_model_r2,
      training_rows: stats.training_rows,
    },
  ];
}

export function deriveHeroMetrics(dataset: PlatformDataRow[]) {
  const cities = dataset.filter((r): r is Extract<PlatformDataRow, { kind: 'city' }> => r.kind === 'city');
  const model = dataset.find((r): r is Extract<PlatformDataRow, { kind: 'model' }> => r.kind === 'model');
  const aggregate = dataset.find(
    (r): r is Extract<PlatformDataRow, { kind: 'aggregate' }> => r.kind === 'aggregate',
  );

  const totalListings = cities.reduce((sum, c) => sum + c.property_count, 0) || aggregate?.total_listings || 0;
  const cityCount = cities.length;
  const modelAccuracyPct = model?.r2 != null ? Math.round(model.r2 * 1000) / 10 : null;
  const trainingRows = model?.training_rows ?? 0;
  const propertyTypeCount = dataset.filter((r) => r.kind === 'property_type').length;

  return {
    totalListings,
    cityCount,
    modelAccuracyPct,
    trainingRows,
    propertyTypeCount,
    cities,
    modelName: model?.name ?? '—',
  };
}
