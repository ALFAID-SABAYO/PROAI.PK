interface ProgressRingProps {
  value: number;
  label: string;
  sublabel?: string;
  size?: number;
}

export function ProgressRing({ value, label, sublabel, size = 88 }: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgb(51 65 85 / 0.6)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500 ease-out"
          />
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold text-white">
          {Math.round(clamped)}%
        </span>
      </div>
      <p className="text-center text-sm font-medium text-slate-200">{label}</p>
      {sublabel && <p className="text-center text-xs text-slate-500">{sublabel}</p>}
    </div>
  );
}
