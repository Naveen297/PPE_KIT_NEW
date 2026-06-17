import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ShieldHalf } from 'lucide-react';
import { Card, CardHeader, DataState } from '@/components/ui';
import { useApiResource } from '@/hooks';
import { getRiskLevel } from '@/api';
import ChartTooltip from '@/lib/chart/ChartTooltip';

/**
 * RiskLevelChart — donut distribution of risk levels from
 * `GET /api/v1/dashboard/charts/risk-level` (always 3 entries:
 * High Risk / Medium Risk / Under Control, each with its own colour).
 *
 * @param {Object} props
 * @param {'daily'|'weekly'|'monthly'} [props.period='monthly']
 */
const RiskLevelChart = ({ period = 'monthly' }) => {
  const { data, loading, error, refetch } = useApiResource(
    (signal) => getRiskLevel(period, signal),
    [period],
  );

  const rows = useMemo(
    () =>
      (data ?? []).map((d) => ({
        name: d.type,
        value: d.count ?? 0,
        fill: d.color,
      })),
    [data],
  );

  const total = rows.reduce((sum, r) => sum + r.value, 0);
  const control = rows.find((r) => /control/i.test(r.name))?.value ?? 0;
  const controlPct = total > 0 ? Math.round((control / total) * 100) : 0;

  return (
    <Card>
      <CardHeader
        title="Risk Distribution"
        subtitle="By severity of PPE gaps"
        icon={<ShieldHalf className="h-[18px] w-[18px]" />}
      />
      <div className="mt-4 min-h-[150px] flex-1">
        <DataState loading={loading} error={error} onRetry={refetch} className="min-h-[150px]">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div className="relative h-[150px] w-[150px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={total > 0 ? rows : [{ name: 'No data', value: 1, fill: '#eef1f6' }]}
                    dataKey="value"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={total > 0 ? 2 : 0}
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                    animationDuration={650}
                  >
                    {(total > 0 ? rows : [{ fill: '#eef1f6' }]).map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  {total > 0 && <Tooltip content={<ChartTooltip />} />}
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="tnum font-display text-2xl font-extrabold leading-none text-ink-900">{total}</span>
                <span className="mt-0.5 text-2xs font-semibold uppercase tracking-wide text-ink-400">events</span>
              </div>
            </div>

            <div className="w-full flex-1 space-y-2">
              {rows.map((r) => {
                const pct = total > 0 ? Math.round((r.value / total) * 100) : 0;
                return (
                  <div key={r.name} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-xs font-medium text-ink-600">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: r.fill }} />
                      {r.name}
                    </span>
                    <span className="tnum text-xs font-bold text-ink-900">
                      {r.value}
                      <span className="ml-1 font-medium text-ink-400">{pct}%</span>
                    </span>
                  </div>
                );
              })}
              <div className="mt-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-2xs font-semibold text-emerald-700">
                {controlPct}% of detections are under control
              </div>
            </div>
          </div>
        </DataState>
      </div>
    </Card>
  );
};

export default RiskLevelChart;
