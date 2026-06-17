import { useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, Calendar, ChevronDown, LineChart as LineIcon } from 'lucide-react';
import { Card, CardHeader, EmptyState, DataState } from '@/components/ui';
import { useApiResource, useClickOutside } from '@/hooks';
import { getIncidentsOverTime } from '@/api';
import { CHART, axisProps, lineCursor } from '@/lib/chart/theme';
import ChartTooltip from '@/lib/chart/ChartTooltip';

const VIEW_MODES = [
  { id: 'weekly', label: 'Last 7 days' },
  { id: 'monthly', label: 'Last 4 weeks' },
  { id: 'custom', label: 'Custom range' },
];

/**
 * IncidentsOverTimeChart — violation trend from
 * `GET /api/v1/dashboard/charts/incidents-over-time`. The viewMode picker maps
 * directly onto the backend's weekly | monthly | custom modes.
 */
const IncidentsOverTimeChart = () => {
  const [viewMode, setViewMode] = useState('weekly');
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState({ start: '', end: '' });
  const ref = useClickOutside(() => setOpen(false));

  // Custom mode only fires once both ends of the range are chosen.
  const customReady = viewMode !== 'custom' || (custom.start && custom.end);
  const params =
    viewMode === 'custom'
      ? { viewMode, startDate: custom.start, endDate: custom.end }
      : { viewMode };

  const { data, loading, error, refetch } = useApiResource(
    (signal) => getIncidentsOverTime(params, signal),
    [viewMode, custom.start, custom.end],
    { enabled: Boolean(customReady) },
  );

  const series = useMemo(() => {
    const labels = data?.labels ?? [];
    const values = data?.values ?? [];
    return labels.map((label, i) => ({ label, violations: values[i] ?? 0 }));
  }, [data]);

  const total = series.reduce((sum, d) => sum + d.violations, 0);
  const hasData = series.some((d) => d.violations > 0);
  const activeLabel = VIEW_MODES.find((m) => m.id === viewMode)?.label ?? 'Custom';
  const subtitle = data?.title
    ? `${data.title} · ${total} violations`
    : 'Violation incidents bucketed over time';

  return (
    <Card>
      <CardHeader
        title="Incidents Over Time"
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
                {VIEW_MODES.map((m) => (
                  <button
                    key={m.id}
                    role="option"
                    aria-selected={viewMode === m.id}
                    onClick={() => {
                      setViewMode(m.id);
                      if (m.id !== 'custom') setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                      viewMode === m.id ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    {m.label}
                    {viewMode === m.id && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                  </button>
                ))}

                {viewMode === 'custom' && (
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
        <span className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-500">
          <span className="h-2 w-2.5 rounded-sm" style={{ backgroundColor: CHART.negative }} />
          Violations
        </span>
      </div>

      <div className="mt-3 h-[248px] w-full">
        {viewMode === 'custom' && !customReady ? (
          <EmptyState
            icon={Calendar}
            title="Select a date range"
            description="Pick a start and end date to load incidents."
            className="h-full"
          />
        ) : (
          <DataState
            loading={loading}
            error={error}
            onRetry={refetch}
            empty={!hasData}
            emptyState={
              <EmptyState
                icon={LineIcon}
                title="No incidents in this range"
                description="Try a wider range or a different view."
                className="h-full"
              />
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="incGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART.negative} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={CHART.negative} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={18} />
                <YAxis {...axisProps} allowDecimals={false} width={42} />
                <Tooltip content={<ChartTooltip />} cursor={lineCursor} />
                <Area
                  type="monotone"
                  name="Violations"
                  dataKey="violations"
                  stroke={CHART.negative}
                  strokeWidth={2.5}
                  fill="url(#incGradient)"
                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                  animationDuration={700}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </DataState>
        )}
      </div>
    </Card>
  );
};

export default IncidentsOverTimeChart;
