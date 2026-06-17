import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * TrendPill — compact delta indicator for KPI cards.
 *
 * @param {Object}  props
 * @param {number}  props.value     - Percentage change (already computed).
 * @param {boolean} [props.goodWhenUp=true] - If false, an upward move is "bad"
 *                                            (e.g. violations rising), so colours invert.
 * @param {'sm'|'xs'} [props.size='sm']
 */
const TrendPill = ({ value, goodWhenUp = true, size = 'sm' }) => {
  const flat = value === 0 || value == null || Number.isNaN(value);
  const up = value > 0;
  const isGood = flat ? null : up === goodWhenUp;

  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  const tone = flat
    ? 'bg-ink-100 text-ink-500'
    : isGood
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-rose-50 text-rose-700';

  return (
    <span
      className={clsx(
        'tnum inline-flex items-center gap-0.5 rounded-full font-bold',
        tone,
        size === 'xs' ? 'px-1.5 py-0.5 text-2xs' : 'px-2 py-0.5 text-xs',
      )}
      title="vs. previous period"
    >
      <Icon className={size === 'xs' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden="true" />
      {flat ? '0%' : `${Math.abs(value).toFixed(1)}%`}
    </span>
  );
};

export default TrendPill;
