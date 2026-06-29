import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { LocationStats } from '../../types';
import { formatPKR } from '../../utils/format';

interface Props {
  data: LocationStats[];
  title?: string;
}

export function LocationBarChart({ data, title = 'Avg Price by Location' }: Props) {
  const chartData = data.map((d) => ({
    name: d.location.length > 18 ? d.location.slice(0, 16) + '…' : d.location,
    avgPrice: d.avg_price / 1_000_000,
    count: d.count,
    city: d.city,
  }));

  return (
    <div className="card p-5">
      <h3 className="mb-4 font-display font-semibold text-surface-900">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => `${v}M`} />
          <Tooltip
            formatter={(value) => [formatPKR(Number(value) * 1_000_000), 'Avg Price']}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload ? `${payload[0].payload.name} (${payload[0].payload.city})` : ''
            }
          />
          <Legend />
          <Bar dataKey="avgPrice" name="Avg Price (M PKR)" fill="#ff3333" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
