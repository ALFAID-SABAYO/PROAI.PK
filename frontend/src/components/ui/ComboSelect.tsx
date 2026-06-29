const CUSTOM_OPTION = '__custom__';

interface ComboSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  customPlaceholder?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function ComboSelect({
  label,
  value,
  options,
  onChange,
  error,
  placeholder = 'Select…',
  customPlaceholder = 'Enter custom value',
  disabled = false,
  loading = false,
}: ComboSelectProps) {
  const isCustom = value !== '' && !options.includes(value);
  const selectValue = isCustom ? CUSTOM_OPTION : value;

  return (
    <div>
      <label className="text-sm font-medium text-surface-800">{label}</label>
      <select
        value={selectValue}
        disabled={disabled || loading}
        onChange={(e) => {
          const next = e.target.value;
          if (next === CUSTOM_OPTION) {
            onChange(isCustom ? value : '');
          } else {
            onChange(next);
          }
        }}
        className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none disabled:bg-surface-100"
      >
        <option value="">{loading ? 'Loading…' : placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        <option value={CUSTOM_OPTION}>Other (enter manually)</option>
      </select>
      {(selectValue === CUSTOM_OPTION || isCustom) && (
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={customPlaceholder}
          className="mt-2 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        />
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface ComboNumberSelectProps {
  label: string;
  value: string;
  options: number[];
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function ComboNumberSelect({
  label,
  value,
  options,
  onChange,
  error,
  disabled = false,
  loading = false,
}: ComboNumberSelectProps) {
  const optionStrings = options.map(String);
  const isCustom = value !== '' && !optionStrings.includes(value);
  const selectValue = isCustom ? CUSTOM_OPTION : value;

  return (
    <div>
      <label className="text-sm font-medium text-surface-800">{label}</label>
      <select
        value={selectValue}
        disabled={disabled || loading}
        onChange={(e) => {
          const next = e.target.value;
          if (next === CUSTOM_OPTION) {
            onChange(isCustom ? value : '');
          } else {
            onChange(next);
          }
        }}
        className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none disabled:bg-surface-100"
      >
        <option value="">{loading ? 'Loading…' : 'Select size…'}</option>
        {options.map((opt) => (
          <option key={opt} value={String(opt)}>
            {opt}
          </option>
        ))}
        <option value={CUSTOM_OPTION}>Other (enter manually)</option>
      </select>
      {(selectValue === CUSTOM_OPTION || isCustom) && (
        <input
          type="number"
          min={0.1}
          step={0.1}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. 4.5"
          className="mt-2 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        />
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
