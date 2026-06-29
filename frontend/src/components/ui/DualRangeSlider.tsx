interface DualRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  disabled?: boolean;
  formatLabel?: (value: number) => string;
}

export function DualRangeSlider({
  min,
  max,
  value,
  onChange,
  disabled = false,
  formatLabel = (v) => v.toLocaleString('en-PK'),
}: DualRangeSliderProps) {
  const [low, high] = value;
  const range = max - min || 1;
  const lowPct = ((low - min) / range) * 100;
  const highPct = ((high - min) / range) * 100;

  const handleLow = (v: number) => {
    onChange([Math.min(v, high), high]);
  };

  const handleHigh = (v: number) => {
    onChange([low, Math.max(v, low)]);
  };

  return (
    <div className={`select-none ${disabled ? 'pointer-events-none opacity-40' : ''}`}>
      <div className="relative mx-2 h-2 rounded-full bg-surface-200">
        <div
          className="absolute h-2 rounded-full bg-primary-500"
          style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={low}
        disabled={disabled}
        onChange={(e) => handleLow(Number(e.target.value))}
        className="relative -mt-2 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600 [&::-webkit-slider-thumb]:shadow-md"
      />
      <input
        type="range"
        min={min}
        max={max}
        value={high}
        disabled={disabled}
        onChange={(e) => handleHigh(Number(e.target.value))}
        className="relative -mt-3 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600 [&::-webkit-slider-thumb]:shadow-md"
      />
      <div className="mt-2 flex justify-between text-xs text-surface-800/60">
        <span>{formatLabel(low)}</span>
        <span>{formatLabel(high)}</span>
      </div>
    </div>
  );
}
