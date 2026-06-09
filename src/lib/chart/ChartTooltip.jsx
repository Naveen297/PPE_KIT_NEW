import { CHART } from './theme';

/**
 * ChartTooltip — premium, consistent tooltip card for all charts.
 *
 * @param {Object}   props
 * @param {boolean}  props.active
 * @param {Array}    props.payload
 * @param {string}   props.label
 * @param {string}   [props.unit]       - Appended to values (e.g. "%").
 * @param {string}   [props.labelText]  - Override for the heading.
 * @param {Function} [props.formatter]  - (value, name) => string
 */
const ChartTooltip = ({ active, payload, label, unit = '', labelText, formatter }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="min-w-[9rem] rounded-xl border border-ink-200 bg-white/95 px-3 py-2 shadow-elevated backdrop-blur">
      <p className="mb-1.5 text-2xs font-bold uppercase tracking-wider text-ink-400">
        {labelText ?? label}
      </p>
      <div className="space-y-1">
        {payload.map((entry, i) => {
          const color = entry.payload?.fill || entry.color || entry.stroke || CHART.brand;
          const value = formatter ? formatter(entry.value, entry.name) : `${entry.value}${unit}`;
          return (
            <div key={i} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-xs font-medium text-ink-600">
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                {entry.name}
              </span>
              <span className="tnum text-xs font-bold text-ink-900">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChartTooltip;
