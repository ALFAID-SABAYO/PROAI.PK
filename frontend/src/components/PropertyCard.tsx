import { Link } from 'react-router-dom';
import type { Property } from '../types';
import { formatPKR } from '../utils/format';

interface PropertyCardProps {
  property: Property;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function PropertyCard({
  property,
  showFavorite,
  isFavorite,
  onToggleFavorite,
}: PropertyCardProps) {
  return (
    <div className="card group overflow-hidden transition hover:shadow-lg hover:-translate-y-0.5">
      <div className="h-2 bg-gradient-to-r from-primary-500 to-accent-500" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-primary-600">
              {property.property_type}
            </span>
            <h3 className="mt-1 font-display text-lg font-semibold text-surface-900">
              {property.location}
            </h3>
            <p className="text-sm text-surface-800/60">
              {property.city} · {property.bedrooms} bed · {property.baths} bath ·{' '}
              {property.area_size} {property.area_type}
            </p>
          </div>
          {showFavorite && onToggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite();
              }}
              className="text-xl transition hover:scale-110"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          )}
        </div>
        <p className="mt-4 font-display text-xl font-bold text-primary-700">
          {formatPKR(property.price)}
        </p>
        <Link
          to={`/properties/${property.id}`}
          className="mt-4 inline-flex items-center text-sm font-medium text-primary-600 transition group-hover:translate-x-1"
        >
          View details & prediction →
        </Link>
      </div>
    </div>
  );
}
