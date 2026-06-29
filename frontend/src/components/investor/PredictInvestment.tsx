import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../api/client';
import { LoadingSpinner } from '../ui/Loading';
import * as predictionService from '../../services/predictionService';
import * as statsService from '../../services/statsService';
import type { AreaOption } from '../../services/statsService';
import type { Prediction } from '../../types';
import { formatPKR, riskColor } from '../../utils/format';

function areaKey(area: AreaOption) {
  return `${area.location}|||${area.city}`;
}

export function PredictInvestment() {
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [areaTypes, setAreaTypes] = useState<string[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [selectedAreaKey, setSelectedAreaKey] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bedrooms, setBedrooms] = useState('3');
  const [baths, setBaths] = useState('2');
  const [areaSize, setAreaSize] = useState('5');
  const [areaType, setAreaType] = useState('Marla');

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Prediction | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedArea = areas.find((a) => areaKey(a) === selectedAreaKey) ?? null;

  useEffect(() => {
    Promise.all([
      statsService.getAreas(),
      statsService.getPropertyTypes(),
      statsService.getAreaTypes(),
    ])
      .then(([areaList, types, units]) => {
        setAreas(areaList);
        setPropertyTypes(types);
        setAreaTypes(units.length ? units : ['Marla', 'Kanal']);
        if (types.length) setPropertyType(types[0]);
        if (units.length) setAreaType(units[0]);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoadingMeta(false));
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedArea) e.area = 'Select an area';
    if (!propertyType) e.propertyType = 'Select property type';
    if (!areaSize || Number(areaSize) <= 0) e.areaSize = 'Enter a valid size';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate() || !selectedArea) return;

    setSubmitting(true);
    setResult(null);
    try {
      const prediction = await predictionService.predictPrice({
        property_type: propertyType,
        location: selectedArea.location,
        city: selectedArea.city,
        bedrooms: Number(bedrooms),
        baths: Number(baths),
        area_type: areaType,
        area_size: Number(areaSize),
        purpose: 'For Sale',
      });
      setResult(prediction);
      toast.success('Prediction generated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card border-l-4 border-l-accent-500 bg-gradient-to-br from-white to-accent-50/30 p-6">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent-600">
        Machine Learning · Price estimate
      </div>
      <h2 className="font-display text-xl font-bold text-surface-900">Predict My Investment</h2>
      <p className="mt-1 text-sm text-surface-800/60">
        Get an ML-based price estimate for a hypothetical property — separate from historical stats above.
      </p>

      {loadingMeta ? (
        <div className="mt-8 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Area</label>
              <select
                value={selectedAreaKey}
                onChange={(e) => setSelectedAreaKey(e.target.value)}
                className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none"
              >
                <option value="">Select area…</option>
                {areas.map((a) => (
                  <option key={areaKey(a)} value={areaKey(a)}>
                    {a.location} — {a.city}
                  </option>
                ))}
              </select>
              {errors.area && <p className="mt-1 text-xs text-red-500">{errors.area}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none"
              >
                {propertyTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Bedrooms</label>
              <input
                type="number"
                min={0}
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Bathrooms</label>
              <input
                type="number"
                min={0}
                value={baths}
                onChange={(e) => setBaths(e.target.value)}
                className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Size</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={areaSize}
                  onChange={(e) => setAreaSize(e.target.value)}
                  className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none"
                />
                <select
                  value={areaType}
                  onChange={(e) => setAreaType(e.target.value)}
                  className="rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none"
                >
                  {areaTypes.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              {errors.areaSize && <p className="mt-1 text-xs text-red-500">{errors.areaSize}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-500 disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {submitting && <LoadingSpinner size="sm" />}
            Get price estimate
          </button>
        </form>
      )}

      {result && (
        <div className="mt-6 rounded-xl border border-accent-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-surface-800/60">Estimated price</p>
          <p className="font-display text-3xl font-bold text-accent-600">
            {formatPKR(result.predicted_price)}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-surface-800/60">Risk score:</span>
            <span className="text-lg font-bold">{result.risk_score}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${riskColor(result.risk_level)}`}
            >
              {result.risk_level} risk
            </span>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-surface-800/50">
            This is an estimate based on historical listing data, not a guaranteed sale price.
          </p>
        </div>
      )}
    </section>
  );
}
