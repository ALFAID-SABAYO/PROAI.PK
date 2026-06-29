import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { LocationStats } from '../../types';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

interface Props {
  data: LocationStats[];
}

export function RiskDistributionChart({ data }: Props) {
  const buckets = { low: 0, medium: 0, high: 0 };
  data.forEach((d) => {
    const score = d.avg_risk_score ?? 50;
    if (score < 33) buckets.low++;
    else if (score < 66) buckets.medium++;
    else buckets.high++;
  });

  const chartData = [
    { name: 'Low Risk', value: buckets.low },
    { name: 'Medium Risk', value: buckets.medium },
    { name: 'High Risk', value: buckets.high },
  ].filter((d) => d.value > 0);

  return (
    <div className="card p-5">
      <h3 className="mb-4 font-display font-semibold text-surface-900">Risk Distribution by Location</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}`}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
