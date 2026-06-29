export function formatPKR(value: number): string {
  if (value >= 10_000_000) {
    return `PKR ${(value / 10_000_000).toFixed(2)} Cr`;
  }
  if (value >= 100_000) {
    return `PKR ${(value / 100_000).toFixed(2)} L`;
  }
  return `PKR ${value.toLocaleString('en-PK')}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-PK');
}

export function riskColor(level: string): string {
  switch (level) {
    case 'low':
      return 'text-risk-low bg-green-50';
    case 'high':
      return 'text-risk-high bg-red-50';
    default:
      return 'text-risk-medium bg-amber-50';
  }
}
