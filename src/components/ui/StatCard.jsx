import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';
import { clsx } from 'clsx';

/**
 * StatCard — premium KPI tile: leading icon, headline value, and a subtle
 * sparkline showing the 14-day trajectory.
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {string|number} props.value
 * @param {React.ReactNode} props.icon
 * @param {Object} props.accent            - { iconBg, iconText, stroke, fill, gradientId }
 * @param {number[]} [props.series]        - Sparkline values.
 */
const StatCard = ({
  label,
  value,
  icon,
  accent,
  series = [],
}) => {
  const data = series.map((v, i) => ({ i, v }));
  const hasTrend = series.length > 0;

  return (
    <div className="group relative flex h-full items-center gap-2.5 overflow-hidden rounded-xl border border-ink-200/70 bg-white px-3 py-2.5 shadow-card transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:shadow-card-hover">
      <span
        className={clsx(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
          accent?.iconBg,
          accent?.iconText,
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1 truncate text-xs font-semibold uppercase tracking-wide text-ink-500">
        {label}
      </div>
      <div className="tnum font-display text-xl font-extrabold leading-none tracking-tight text-ink-900">
        {value}
      </div>
      {hasTrend && (
        <div className="h-7 w-16 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 3, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={accent?.gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accent?.stroke} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={accent?.stroke} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={['dataMin', 'dataMax']} />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={accent?.stroke}
                  strokeWidth={2}
                  fill={`url(#${accent?.gradientId})`}
                  isAnimationActive
                  animationDuration={700}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
    </div>
  );
};

export default StatCard;
