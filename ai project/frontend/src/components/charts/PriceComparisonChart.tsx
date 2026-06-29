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
import { formatPKR } from '../../utils/format';

interface Props {
  listed: number;
  predicted: number;
}

export function PriceComparisonChart({ listed, predicted }: Props) {
  const data = [
    { name: 'Listed', value: listed / 1_000_000 },
    { name: 'Predicted', value: predicted / 1_000_000 },
  ];

  return (
    <div className="card p-5">
      <h3 className="mb-4 font-display font-semibold text-surface-900">Listed vs Predicted Price</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(v) => `${v}M`} />
          <Tooltip formatter={(value) => formatPKR(Number(value) * 1_000_000)} />
          <Legend />
          <Bar dataKey="value" name="Price (M PKR)" fill="#10b981" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
