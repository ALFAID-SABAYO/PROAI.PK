type Status = 'active' | 'stalled' | 'inactive' | 'pending';

const styles: Record<Status, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  stalled: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  inactive: 'bg-red-500/15 text-red-400 border-red-500/30',
  pending: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
};

export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {label ?? status}
    </span>
  );
}
