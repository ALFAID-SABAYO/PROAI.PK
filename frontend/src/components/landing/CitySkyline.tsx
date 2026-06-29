import { motion } from 'framer-motion';

interface CitySkylineProps {
  className?: string;
  variant?: 'hero' | 'compact';
  listingsLabel?: string;
  accuracyLabel?: string;
  citiesLabel?: string;
}

const windows = [
  { x: 12, y: 42, w: 8, h: 10, delay: 0 },
  { x: 24, y: 28, w: 6, h: 8, delay: 0.3 },
  { x: 38, y: 18, w: 10, h: 12, delay: 0.6 },
  { x: 54, y: 32, w: 7, h: 9, delay: 0.2 },
  { x: 66, y: 22, w: 9, h: 11, delay: 0.5 },
  { x: 80, y: 36, w: 8, h: 10, delay: 0.8 },
  { x: 92, y: 26, w: 6, h: 8, delay: 0.4 },
  { x: 104, y: 14, w: 11, h: 13, delay: 0.7 },
  { x: 120, y: 30, w: 8, h: 10, delay: 0.1 },
  { x: 134, y: 20, w: 7, h: 9, delay: 0.9 },
  { x: 148, y: 38, w: 9, h: 11, delay: 0.35 },
  { x: 162, y: 24, w: 10, h: 12, delay: 0.55 },
  { x: 178, y: 16, w: 12, h: 14, delay: 0.25 },
  { x: 196, y: 34, w: 8, h: 10, delay: 0.65 },
  { x: 210, y: 22, w: 9, h: 11, delay: 0.45 },
  { x: 226, y: 40, w: 7, h: 8, delay: 0.75 },
  { x: 238, y: 28, w: 10, h: 12, delay: 0.15 },
  { x: 254, y: 18, w: 8, h: 10, delay: 0.85 },
  { x: 268, y: 32, w: 9, h: 11, delay: 0.5 },
  { x: 284, y: 24, w: 11, h: 13, delay: 0.2 },
];

export function CitySkyline({
  className = '',
  variant = 'hero',
  listingsLabel = '—',
  accuracyLabel = '—',
  citiesLabel = '—',
}: CitySkylineProps) {
  const height = variant === 'hero' ? 280 : 160;

  return (
    <div className={`relative w-full overflow-hidden ${className}`} aria-hidden>
      <svg
        viewBox={`0 0 320 ${height}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(51 136 255 / 0.15)" />
            <stop offset="100%" stopColor="rgb(15 23 42 / 0)" />
          </linearGradient>
          <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(30 58 138 / 0.9)" />
            <stop offset="100%" stopColor="rgb(15 23 42 / 0.95)" />
          </linearGradient>
          <linearGradient id="buildingGradLight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(51 136 255 / 0.4)" />
            <stop offset="100%" stopColor="rgb(16 185 129 / 0.2)" />
          </linearGradient>
        </defs>

        <rect width="320" height={height} fill="url(#skyGrad)" />

        {/* Ground */}
        <rect x="0" y={height - 8} width="320" height="8" fill="rgb(16 185 129 / 0.25)" />

        {/* Buildings silhouette */}
        <path
          d={`M0 ${height} L0 120 L18 120 L18 95 L32 95 L32 70 L48 70 L48 45 L62 45 L62 80 L78 80 L78 55 L94 55 L94 35 L110 35 L110 65 L126 65 L126 50 L142 50 L142 30 L158 30 L158 60 L174 60 L174 40 L190 40 L190 75 L206 75 L206 48 L222 48 L222 25 L240 25 L240 55 L256 55 L256 38 L272 38 L272 68 L288 68 L288 42 L304 42 L304 85 L320 85 L320 ${height} Z`}
          fill="url(#buildingGrad)"
          stroke="rgb(51 136 255 / 0.2)"
          strokeWidth="0.5"
        />

        {/* Building highlights */}
        <path
          d="M48 45 L62 45 L62 80 L48 80 Z M142 30 L158 30 L158 60 L142 60 Z M222 25 L240 25 L240 55 L222 55 Z"
          fill="url(#buildingGradLight)"
          opacity="0.5"
        />

        {/* Animated windows */}
        {windows.map((w, i) => (
          <motion.rect
            key={i}
            x={w.x}
            y={w.y}
            width={w.w}
            height={w.h}
            rx="1"
            fill="rgb(250 204 21)"
            initial={{ opacity: 0.15 }}
            animate={{ opacity: [0.15, 0.85, 0.35, 0.7, 0.15] }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              delay: w.delay,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Crane accent */}
        <motion.g
          animate={{ rotate: [-1, 1, -1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '240px 20px' }}
        >
          <line x1="240" y1="20" x2="240" y2="5" stroke="rgb(51 136 255 / 0.6)" strokeWidth="1.5" />
          <line x1="240" y1="8" x2="258" y2="8" stroke="rgb(51 136 255 / 0.6)" strokeWidth="1.5" />
          <line x1="258" y1="8" x2="258" y2="14" stroke="rgb(16 185 129 / 0.8)" strokeWidth="1" />
        </motion.g>
      </svg>

      {variant === 'hero' && (
        <>
          <motion.div
            className="glass-card absolute left-[8%] top-[18%] px-4 py-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <p className="text-xs text-slate-400">Model accuracy (R²)</p>
            <p className="font-display text-xl font-bold text-violet-300">{accuracyLabel}</p>
          </motion.div>
          <motion.div
            className="glass-card absolute right-[6%] top-[32%] px-4 py-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <p className="text-xs text-slate-400">Listings in database</p>
            <p className="font-display text-xl font-bold text-indigo-300">{listingsLabel}</p>
          </motion.div>
          <motion.div
            className="glass-card absolute bottom-[22%] left-[38%] px-4 py-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <p className="text-xs text-slate-400">Cities covered</p>
            <p className="font-display text-lg font-bold text-white">{citiesLabel}</p>
          </motion.div>
        </>
      )}
    </div>
  );
}
