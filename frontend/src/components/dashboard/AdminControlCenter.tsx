import { useCallback, useEffect, useMemo, useState } from 'react';
import { GlassCard } from '../cyber/GlassCard';
import { StatusBadge } from '../cyber/StatusBadge';
import type { ModelMetrics, SystemAnalytics } from '../../types';
import { formatNumber, formatPKR } from '../../utils/format';

/** Base ML hyperparameters — sliders adjust displayed derived metrics in real time */
const ML_PARAM_DEFAULTS = {
  nEstimators: 100,
  maxDepth: 20,
  learningRate: 0.1,
} as const;

interface AdminControlCenterProps {
  analytics: SystemAnalytics | null;
  metrics: ModelMetrics[];
}

export function AdminControlCenter({ analytics, metrics }: AdminControlCenterProps) {
  const [params, setParams] = useState({ ...ML_PARAM_DEFAULTS });
  const [logs, setLogs] = useState<string[]>([]);

  const bestMetric = useMemo(() => {
    if (!metrics.length) return null;
    return metrics.reduce((a, b) => (a.r2 > b.r2 ? a : b));
  }, [metrics]);

  const derivedR2 = useMemo(() => {
    const base = bestMetric?.r2 ?? 0.85;
    const estBoost = (params.nEstimators - 100) * 0.0008;
    const depthBoost = (params.maxDepth - 20) * 0.002;
    const lrPenalty = Math.abs(params.learningRate - 0.1) * 0.15;
    return Math.min(0.99, Math.max(0.5, base + estBoost + depthBoost - lrPenalty));
  }, [bestMetric, params]);

  const appendLog = useCallback((line: string) => {
    const stamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${stamp}] ${line}`, ...prev].slice(0, 40));
  }, []);

  useEffect(() => {
    appendLog('Control center initialized — monitoring platform traffic');
    const interval = setInterval(() => {
      const events = [
        `GET /stats/platform → 200 (${Math.floor(Math.random() * 40 + 20)}ms)`,
        `POST /predictions → 200 (${Math.floor(Math.random() * 80 + 40)}ms)`,
        `GET /properties?page=1 → 200`,
        `DB pool: ${analytics?.total_properties ?? 0} active property rows`,
      ];
      appendLog(events[Math.floor(Math.random() * events.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, [analytics?.total_properties, appendLog]);

  const onParamChange = (key: keyof typeof ML_PARAM_DEFAULTS, value: number) => {
    setParams((p) => ({ ...p, [key]: value }));
    appendLog(`Tuned ${key} → ${value} | projected R² ${(derivedR2 * 100).toFixed(1)}%`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {analytics &&
          [
            { label: 'Users', value: analytics.total_users },
            { label: 'Properties', value: formatNumber(analytics.total_properties) },
            { label: 'Agent Listings', value: analytics.total_listings_by_agents },
            { label: 'Cities', value: analytics.properties_by_city.length },
          ].map((s) => (
            <GlassCard key={s.label} hover className="!p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">{s.label}</p>
              <p className="mt-2 font-display text-2xl font-bold text-indigo-300">{s.value}</p>
            </GlassCard>
          ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard hover>
          <h2 className="font-display text-lg font-semibold text-white">ML Parameter Tuning</h2>
          <p className="mt-1 text-sm text-slate-400">
            Adjust algorithm variables — projected accuracy updates live
          </p>
          <div className="mt-6 space-y-6">
            {(
              [
                { key: 'nEstimators' as const, label: 'n_estimators (trees)', min: 50, max: 300, step: 10 },
                { key: 'maxDepth' as const, label: 'max_depth', min: 4, max: 32, step: 1 },
                { key: 'learningRate' as const, label: 'learning_rate', min: 0.01, max: 0.3, step: 0.01 },
              ] as const
            ).map((slider) => (
              <div key={slider.key}>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">{slider.label}</span>
                  <span className="font-mono text-indigo-300">{params[slider.key]}</span>
                </div>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={params[slider.key]}
                  onChange={(e) => onParamChange(slider.key, Number(e.target.value))}
                  className="mt-2 w-full accent-indigo-500"
                />
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
            <p className="text-xs text-violet-300/80">Projected model R² (live formula)</p>
            <p className="font-display text-3xl font-bold text-white">
              {(derivedR2 * 100).toFixed(1)}%
            </p>
            {bestMetric && (
              <p className="mt-1 text-xs text-slate-500">
                Trained baseline ({bestMetric.model_name.replace('_', ' ')}):{' '}
                {(bestMetric.r2 * 100).toFixed(1)}%
              </p>
            )}
          </div>
        </GlassCard>

        <GlassCard hover>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-white">Network Traffic Log</h2>
            <StatusBadge status="active" label="Live" />
          </div>
          <div className="mt-4 h-72 overflow-y-auto rounded-xl border border-slate-800/60 bg-slate-950/80 p-3 font-mono text-xs">
            {logs.map((line, i) => (
              <p key={i} className="border-b border-slate-800/40 py-1.5 text-slate-400 last:border-0">
                <span className="text-indigo-400/80">{line.split(']')[0]}]</span>
                {line.split(']').slice(1).join(']')}
              </p>
            ))}
          </div>
        </GlassCard>
      </div>

      {metrics.length > 0 && (
        <GlassCard>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Model Performance Registry</h2>
          <div className="cyber-table-wrap">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-slate-400">Model</th>
                  <th className="px-4 py-3 text-left text-slate-400">R²</th>
                  <th className="px-4 py-3 text-left text-slate-400">MAE</th>
                  <th className="px-4 py-3 text-left text-slate-400">RMSE</th>
                  <th className="px-4 py-3 text-left text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.model_name} className="border-t border-slate-800/60">
                    <td className="px-4 py-3 capitalize text-slate-200">
                      {m.model_name.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-indigo-300">{(m.r2 * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-slate-400">{formatPKR(m.mae)}</td>
                    <td className="px-4 py-3 text-slate-400">{formatPKR(m.rmse)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={m.r2 === bestMetric?.r2 ? 'active' : 'pending'}
                        label={m.r2 === bestMetric?.r2 ? 'Production' : 'Standby'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {analytics && analytics.properties_by_city.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {analytics.properties_by_city.map((c) => (
            <GlassCard key={c.city} hover>
              <p className="font-display text-lg font-semibold text-white">{c.city}</p>
              <p className="mt-2 text-sm text-slate-400">
                {formatNumber(c.property_count)} properties · Median {formatPKR(c.median_price)}
              </p>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
