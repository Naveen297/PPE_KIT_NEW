import { useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, Calendar, ChevronDown, LineChart as LineIcon } from 'lucide-react';
import { Card, CardHeader, EmptyState } from '@/components/ui';
import { useClickOutside } from '@/hooks';
import { CHART, axisProps, lineCursor } from '@/lib/chart/theme';
import ChartTooltip from '@/lib/chart/ChartTooltip';

const DAY_MS = 24 * 60 * 60 * 1000;
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const endOfDay = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };

/** Preset → {start, end} resolver. */
const resolvePreset = (id) => {
  const now = new Date();
  const today = startOfDay(now);
  switch (id) {
    case 'today':
      return { start: today, end: endOfDay(now) };
    case 'yesterday': {
      const y = new Date(today.getTime() - DAY_MS);
      return { start: y, end: endOfDay(y) };
    }
    case '7d':
      return { start: startOfDay(new Date(now.getTime() - 6 * DAY_MS)), end: endOfDay(now) };
    case '30d':
      return { start: startOfDay(new Date(now.getTime() - 29 * DAY_MS)), end: endOfDay(now) };
    case '90d':
      return { start: startOfDay(new Date(now.getTime() - 89 * DAY_MS)), end: endOfDay(now) };
    case 'thisMonth':
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: endOfDay(now) };
    case 'lastMonth':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: endOfDay(new Date(now.getFullYear(), now.getMonth(), 0)),
      };
    default:
      return { start: startOfDay(new Date(now.getTime() - 6 * DAY_MS)), end: endOfDay(now) };
  }
};

const PRESETS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
  { id: 'thisMonth', label: 'This month' },
  { id: 'lastMonth', label: 'Last month' },
  { id: 'custom', label: 'Custom range' },
];

/** Buckets detections within [start,end] into time-series points. */
const buildSeries = (detections, start, end) => {
  if (!start || !end || end < start) return [];
  const spanDays = (endOfDay(end) - startOfDay(start)) / DAY_MS;

  const fmtDay = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const fmtHour = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

  let edges = [];
  let labelFor;
  if (spanDays <= 1.5) {
    // hourly across the day(s), 3-hour blocks
    const s = startOfDay(start);
    for (let h = 0; h < 24; h += 3) edges.push(new Date(s.getTime() + h * 60 * 60 * 1000));
    labelFor = fmtHour;
  } else if (spanDays <= 45) {
    const s = startOfDay(start);
    const n = Math.ceil(spanDays);
    for (let i = 0; i < n; i++) edges.push(new Date(s.getTime() + i * DAY_MS));
    labelFor = fmtDay;
  } else {
    const s = startOfDay(start);
    const weeks = Math.ceil(spanDays / 7);
    for (let i = 0; i < weeks; i++) edges.push(new Date(s.getTime() + i * 7 * DAY_MS));
    labelFor = (d) => `${fmtDay(d)}`;
  }

  const buckets = edges.map((edge, i) => ({
    label: labelFor(edge),
    edge: edge.getTime(),
    next: edges[i + 1] ? edges[i + 1].getTime() : endOfDay(end).getTime() + 1,
    detections: 0,
    violations: 0,
  }));

  detections.forEach((d) => {
    const t = new Date(d.timestamp).getTime();
    if (Number.isNaN(t) || t < start.getTime() || t > endOfDay(end).getTime()) return;
    const b = buckets.find((bk) => t >= bk.edge && t < bk.next);
    if (!b) return;
    b.detections += 1;
    if (d.status === 'violation') b.violations += 1;
  });

  return buckets.map(({ label, detections, violations }) => ({ label, detections, violations }));
};

/**
 * IncidentsOverTimeChart — hero trend visualization. Area = total detections,
 * line = violations, filtered by a professional preset date-range picker.
 */
const IncidentsOverTimeChart = ({ detections = [] }) => {
  const [preset, setPreset] = useState('7d');
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState({ start: '', end: '' });
  const ref = useClickOutside(() => setOpen(false));

  const range = useMemo(() => {
    if (preset === 'custom') {
      if (!custom.start || !custom.end) return null;
      return { start: startOfDay(new Date(custom.start)), end: endOfDay(new Date(custom.end)) };
    }
    return resolvePreset(preset);
  }, [preset, custom]);

  const data = useMemo(
    () => (range ? buildSeries(detections, range.start, range.end) : []),
    [detections, range],
  );

  const totals = useMemo(
    () =>
      data.reduce(
        (acc, d) => ({ det: acc.det + d.detections, viol: acc.viol + d.violations }),
        { det: 0, viol: 0 },
      ),
    [data],
  );

  const activeLabel = PRESETS.find((p) => p.id === preset)?.label ?? 'Custom';
  const subtitle = range
    ? `${range.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${range.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${totals.det} detections · ${totals.viol} violations`
    : 'Select a custom date range';

  return (
    <Card>
      <CardHeader
        title="Detections Over Time"
        subtitle={subtitle}
        icon={<Activity className="h-[18px] w-[18px]" />}
        actions={
          <div className="relative" ref={ref}>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="flex h-9 items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-700 shadow-xs transition-colors hover:bg-ink-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40"
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              <Calendar className="h-3.5 w-3.5 text-ink-400" aria-hidden="true" />
              {activeLabel}
              <ChevronDown className={`h-3.5 w-3.5 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            {open && (
              <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right animate-scale-in rounded-xl border border-ink-200 bg-white p-1.5 shadow-elevated" role="listbox">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    role="option"
                    aria-selected={preset === p.id}
                    onClick={() => {
                      setPreset(p.id);
                      if (p.id !== 'custom') setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                      preset === p.id ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    {p.label}
                    {preset === p.id && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                  </button>
                ))}

                {preset === 'custom' && (
                  <div className="mt-1 space-y-2 border-t border-ink-100 p-2">
                    {[['start', 'From'], ['end', 'To']].map(([key, lbl]) => (
                      <label key={key} className="block">
                        <span className="mb-1 block text-2xs font-semibold uppercase tracking-wide text-ink-400">{lbl}</span>
                        <input
                          type="date"
                          value={custom[key]}
                          onChange={(e) => setCustom((c) => ({ ...c, [key]: e.target.value }))}
                          className="w-full rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs text-ink-700 focus:border-brand-400 focus:outline-none"
                        />
                      </label>
                    ))}
                    <button
                      onClick={() => setOpen(false)}
                      disabled={!custom.start || !custom.end}
                      className="w-full rounded-lg bg-brand-600 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Apply range
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        }
      />

      <div className="mt-4 flex items-center gap-4">
        {[
          { label: 'Detections', color: CHART.brand },
          { label: 'Violations', color: CHART.negative },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-500">
            <span className="h-2 w-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
            {l.label}
          </span>
        ))}
      </div>

      <div className="mt-3 h-[248px] w-full">
        {data.length > 0 && totals.det + totals.viol >= 0 && data.some((d) => d.detections || d.violations) ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="detGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART.brand} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={CHART.brand} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={18} />
              <YAxis {...axisProps} allowDecimals={false} width={42} />
              <Tooltip content={<ChartTooltip />} cursor={lineCursor} />
              <Area
                type="monotone"
                name="Detections"
                dataKey="detections"
                stroke={CHART.brand}
                strokeWidth={2.5}
                fill="url(#detGradient)"
                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                animationDuration={700}
              />
              <Line
                type="monotone"
                name="Violations"
                dataKey="violations"
                stroke={CHART.negative}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                animationDuration={700}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            icon={LineIcon}
            title="No detections in this range"
            description="Try a wider date range or a different preset."
            className="h-full"
          />
        )}
      </div>
    </Card>
  );
};

export default IncidentsOverTimeChart;
