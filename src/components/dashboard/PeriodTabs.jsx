import { clsx } from 'clsx';

const PERIODS = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
];

/**
 * PeriodTabs — segmented control for the dashboard reporting window. Drives the
 * `period` query param (daily | weekly | monthly) on stats + period-based charts.
 *
 * @param {Object} props
 * @param {'daily'|'weekly'|'monthly'} props.value
 * @param {(period: string) => void} props.onChange
 */
const PeriodTabs = ({ value, onChange }) => (
  <div className="inline-flex items-center gap-1 rounded-lg bg-ink-100/70 p-1" role="tablist" aria-label="Reporting period">
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
);

export default PeriodTabs;
