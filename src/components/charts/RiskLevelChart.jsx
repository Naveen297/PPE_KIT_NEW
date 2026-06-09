import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ShieldHalf } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui';
import { CHART } from '@/lib/chart/theme';
import ChartTooltip from '@/lib/chart/ChartTooltip';

const RISK_CONFIG = [
  { key: 'high', label: 'High Risk', color: CHART.risk.high },
  { key: 'medium', label: 'Medium Risk', color: CHART.risk.medium },
  { key: 'control', label: 'Under Control', color: CHART.risk.control },
];

/**
 * RiskLevelChart — donut distribution of risk levels derived from how many PPE
 * items are missing per detection (≥2 high, 1 medium, 0 under control).
 */
const RiskLevelChart = ({ detections = [] }) => {
  const counts = useMemo(() => {
    let high = 0, medium = 0, control = 0;
    detections.forEach((d) => {
      const missing = d.missingItems?.length ?? 0;
      if (missing >= 2) high += 1;
      else if (missing === 1) medium += 1;
      else control += 1;
    });
    return { high, medium, control };
  }, [detections]);

  const total = counts.high + counts.medium + counts.control;
  const data = RISK_CONFIG.map((r) => ({ name: r.label, value: counts[r.key], fill: r.color }));
  const controlPct = total > 0 ? Math.round((counts.control / total) * 100) : 0;

  return (
    <Card>
      <CardHeader
        title="Risk Distribution"
        subtitle="By severity of PPE gaps"
        icon={<ShieldHalf className="h-[18px] w-[18px]" />}
      />
      <div className="mt-4 flex flex-1 flex-col items-center gap-4 sm:flex-row sm:items-center">
        <div className="relative h-[150px] w-[150px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={total > 0 ? data : [{ name: 'No data', value: 1, fill: '#eef1f6' }]}
                dataKey="value"
                innerRadius={48}
                outerRadius={70}
                paddingAngle={total > 0 ? 2 : 0}
                stroke="none"
                startAngle={90}
                endAngle={-270}
                animationDuration={650}
              >
                {(total > 0 ? data : [{ fill: '#eef1f6' }]).map((entry, i) => (
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
          {RISK_CONFIG.map((r) => {
            const v = counts[r.key];
            const pct = total > 0 ? Math.round((v / total) * 100) : 0;
            return (
              <div key={r.key} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-xs font-medium text-ink-600">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: r.color }} />
                  {r.label}
                </span>
                <span className="tnum text-xs font-bold text-ink-900">
                  {v}
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
    </Card>
  );
};

export default RiskLevelChart;
