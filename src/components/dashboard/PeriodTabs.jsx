import { clsx } from 'clsx';

const PERIODS = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'custom', label: 'Custom' },
];

/**
 * PeriodTabs — segmented control for the dashboard reporting window. Drives the
 * `period` query param (daily | weekly | monthly | custom) on stats + period-based
 * charts. When `custom` is active, two date inputs let the user pick an explicit
 * start/end range.
 *
 * @param {Object} props
 * @param {'daily'|'weekly'|'monthly'|'custom'} props.value
 * @param {(period: string) => void} props.onChange
 * @param {{ startDate: string, endDate: string }} [props.customRange]
 * @param {(range: { startDate: string, endDate: string }) => void} [props.onCustomRangeChange]
 */
const PeriodTabs = ({ value, onChange, customRange, onCustomRangeChange }) => {
  const { startDate = '', endDate = '' } = customRange ?? {};

  const update = (patch) => onCustomRangeChange?.({ startDate, endDate, ...patch });

  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      <div
        className="inline-flex items-center gap-1 rounded-lg bg-ink-100/70 p-1"
        role="tablist"
        aria-label="Reporting period"
      >
        {PERIODS.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={value === p.id}
            onClick={() => onChange(p.id)}
            className={clsx(
              'rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all',
              value === p.id ? 'bg-white text-brand-700 shadow-xs' : 'text-ink-500 hover:text-ink-700',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {value === 'custom' && (
        <div className="flex items-center gap-1.5 animate-fade-in">
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => update({ startDate: e.target.value })}
            aria-label="Start date"
            className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-medium text-ink-700 shadow-xs transition-colors hover:bg-ink-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40"
          />
          <span className="text-2xs font-semibold uppercase tracking-wide text-ink-400">to</span>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => update({ endDate: e.target.value })}
            aria-label="End date"
            className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-medium text-ink-700 shadow-xs transition-colors hover:bg-ink-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40"
          />
        </div>
      )}
    </div>
  );
};

export default PeriodTabs;
