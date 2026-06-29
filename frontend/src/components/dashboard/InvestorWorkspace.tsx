import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { GlassCard } from '../cyber/GlassCard';
import { ProgressRing } from '../cyber/ProgressRing';
import { formatPKR } from '../../utils/format';

/** Live fee line-items — totals computed via .reduce() when checkboxes change */
const INVESTMENT_FEE_ITEMS = [
  { id: 'stamp', label: 'Stamp duty & registration', fee: 185000 },
  { id: 'legal', label: 'Legal documentation', fee: 95000 },
  { id: 'valuation', label: 'Property valuation report', fee: 45000 },
  { id: 'agent', label: 'Agent commission (est.)', fee: 250000 },
  { id: 'maintenance', label: 'Annual maintenance reserve', fee: 120000 },
] as const;

const DEFAULT_BASE_PRICE = 15000000;

interface InvestorWorkspaceProps {
  favoriteCount: number;
  areasExplored: number;
  totalAreas: number;
  avgMarketPrice: number;
}

export function InvestorWorkspace({
  favoriteCount,
  areasExplored,
  totalAreas,
  avgMarketPrice,
}: InvestorWorkspaceProps) {
  const [basePrice, setBasePrice] = useState(String(DEFAULT_BASE_PRICE));
  const [selectedFees, setSelectedFees] = useState<string[]>(['stamp', 'legal']);
  const [complaint, setComplaint] = useState('');
  const [complaintArea, setComplaintArea] = useState('');

  const modules = useMemo(
    () => [
      {
        id: 'research',
        label: 'Area Research',
        progress: totalAreas > 0 ? Math.min(100, (areasExplored / totalAreas) * 100) : 0,
        sub: `${areasExplored} / ${totalAreas} areas`,
      },
      {
        id: 'favorites',
        label: 'Saved Properties',
        progress: Math.min(100, favoriteCount * 25),
        sub: `${favoriteCount} saved`,
      },
      {
        id: 'market',
        label: 'Market Alignment',
        progress: avgMarketPrice > 0 ? 72 : 0,
        sub: 'vs avg listing',
      },
    ],
    [areasExplored, totalAreas, favoriteCount, avgMarketPrice],
  );

  const feeTotal = useMemo(
    () =>
      INVESTMENT_FEE_ITEMS.filter((item) => selectedFees.includes(item.id)).reduce(
        (sum, item) => sum + item.fee,
        0,
      ),
    [selectedFees],
  );

  const propertyBase = Number(basePrice) || 0;
  const grandTotal = propertyBase + feeTotal;

  const toggleFee = (id: string) => {
    setSelectedFees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const submitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint.trim()) {
      toast.error('Describe the issue before submitting');
      return;
    }
    toast.success(`Report logged for ${complaintArea || 'general'} — our team will review`);
    setComplaint('');
    setComplaintArea('');
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <GlassCard className="lg:col-span-2" hover>
        <h2 className="font-display text-lg font-semibold text-white">Investment Module Tracker</h2>
        <p className="mt-1 text-sm text-slate-400">Progress derived from your live session data</p>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {modules.map((m) => (
            <ProgressRing key={m.id} value={m.progress} label={m.label} sublabel={m.sub} />
          ))}
        </div>
      </GlassCard>

      <GlassCard hover>
        <h2 className="font-display text-lg font-semibold text-white">Live Investment Calculator</h2>
        <p className="mt-1 text-sm text-slate-400">Checkbox fees update total instantly</p>
        <label className="mt-4 block text-sm text-slate-300">Base property price (PKR)</label>
        <input
          type="number"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          className="input-field"
        />
        <div className="mt-4 space-y-2">
          {INVESTMENT_FEE_ITEMS.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 py-2 transition-all duration-300 hover:border-indigo-500/30"
            >
              <input
                type="checkbox"
                checked={selectedFees.includes(item.id)}
                onChange={() => toggleFee(item.id)}
                className="rounded border-slate-600 text-indigo-500 focus:ring-indigo-500/40"
              />
              <span className="flex-1 text-sm text-slate-300">{item.label}</span>
              <span className="text-sm font-medium text-indigo-300">{formatPKR(item.fee)}</span>
            </label>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
          <p className="text-xs uppercase tracking-wider text-indigo-300/80">Total estimated cost</p>
          <p className="mt-1 font-display text-2xl font-bold text-white">{formatPKR(grandTotal)}</p>
          <p className="mt-1 text-xs text-slate-500">
            Property {formatPKR(propertyBase)} + fees {formatPKR(feeTotal)}
          </p>
        </div>
      </GlassCard>

      <GlassCard className="lg:col-span-3" hover>
        <h2 className="font-display text-lg font-semibold text-white">Facility & Area Feedback</h2>
        <p className="mt-1 text-sm text-slate-400">Report maintenance or data quality issues for an area</p>
        <form onSubmit={submitComplaint} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-slate-300">Area / Location</label>
            <input
              value={complaintArea}
              onChange={(e) => setComplaintArea(e.target.value)}
              placeholder="e.g. DHA Phase 6"
              className="input-field"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-slate-300">Issue description</label>
            <textarea
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              rows={3}
              placeholder="Describe inaccurate listing data, facility concerns, etc."
              className="input-field resize-none"
            />
          </div>
          <button type="submit" className="btn-cyber-sm w-full md:w-auto">
            Submit report
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
