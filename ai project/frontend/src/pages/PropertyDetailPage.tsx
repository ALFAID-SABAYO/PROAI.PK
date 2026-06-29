import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/client';
import { PriceComparisonChart } from '../components/charts/PriceComparisonChart';
import { AppLayout } from '../components/layout/AppLayout';
import { PageLoader } from '../components/ui/Loading';
import * as predictionService from '../services/predictionService';
import * as propertyService from '../services/propertyService';
import type { Prediction, Property } from '../types';
import { formatPKR, riskColor } from '../utils/format';

export function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      propertyService.getProperty(Number(id)),
      predictionService.getPropertyPrediction(Number(id)),
    ])
      .then(([prop, pred]) => {
        setProperty(prop);
        setPrediction(pred);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <PageLoader />
      </AppLayout>
    );
  }

  if (!property || !prediction) {
    return (
      <AppLayout>
        <div className="page-container py-20 text-center">
          <p>Property not found</p>
          <Link to="/investor" className="mt-4 text-primary-600 hover:underline">
            Back to search
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-container">
        <Link to="/investor" className="text-sm text-primary-600 hover:underline">
          ← Back to search
        </Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <span className="text-xs font-medium uppercase tracking-wide text-primary-600">
              {property.property_type}
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold text-surface-900">
              {property.location}
            </h1>
            <p className="text-surface-800/60">
              {property.city}, {property.province_name}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-surface-50 p-3">
                <p className="text-surface-800/60">Listed Price</p>
                <p className="font-semibold text-primary-700">{formatPKR(property.price)}</p>
              </div>
              <div className="rounded-lg bg-surface-50 p-3">
                <p className="text-surface-800/60">Predicted Price</p>
                <p className="font-semibold text-accent-600">{formatPKR(prediction.predicted_price)}</p>
              </div>
              <div className="rounded-lg bg-surface-50 p-3">
                <p className="text-surface-800/60">Bedrooms / Baths</p>
                <p className="font-semibold">
                  {property.bedrooms} bed · {property.baths} bath
                </p>
              </div>
              <div className="rounded-lg bg-surface-50 p-3">
                <p className="text-surface-800/60">Area</p>
                <p className="font-semibold">
                  {property.area_size} {property.area_type}
                </p>
              </div>
            </div>

            {prediction.price_difference_pct != null && (
              <div
                className={`mt-4 rounded-lg p-3 text-sm ${
                  prediction.price_difference_pct > 0
                    ? 'bg-amber-50 text-amber-800'
                    : 'bg-green-50 text-green-800'
                }`}
              >
                Listed price is{' '}
                <strong>{Math.abs(prediction.price_difference_pct).toFixed(1)}%</strong>{' '}
                {prediction.price_difference_pct > 0 ? 'above' : 'below'} predicted value
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold">Investment Risk</h2>
              <div className="mt-4 flex items-center gap-4">
                <div className="text-4xl font-bold text-surface-900">{prediction.risk_score}</div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${riskColor(prediction.risk_level)}`}
                >
                  {prediction.risk_level} risk
                </span>
              </div>
              <p className="mt-3 text-sm text-surface-800/60">
                Based on price volatility in {property.location}, {property.city}
              </p>
            </div>

            <PriceComparisonChart listed={property.price} predicted={prediction.predicted_price} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
