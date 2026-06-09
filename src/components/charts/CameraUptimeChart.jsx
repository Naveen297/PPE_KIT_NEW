import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';
import { Video } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui';
import { CHART } from '@/lib/chart/theme';

const UPTIME_DATA = { uptime: 95.8, downtime: 4.2, totalHours: 720, uptimeHours: 690 };

/** CameraUptimeChart — radial gauge of system camera availability. */
const CameraUptimeChart = () => {
  const { uptime, downtime, totalHours, uptimeHours } = UPTIME_DATA;
  const data = [{ name: 'Uptime', value: uptime, fill: CHART.brand }];

  return (
    <Card>
      <CardHeader
        title="Camera Uptime"
        subtitle="System availability · last 30 days"
        icon={<Video className="h-[18px] w-[18px]" />}
      />
      <div className="mt-4 flex flex-1 flex-col items-center gap-4 sm:flex-row sm:items-center">
        <div className="relative h-[150px] w-[150px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="74%"
              outerRadius="100%"
              data={data}
              startAngle={90}
              endAngle={-270}
              barSize={14}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar
                dataKey="value"
                cornerRadius={8}
                background={{ fill: '#eef1f6' }}
                animationDuration={750}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="tnum font-display text-2xl font-extrabold leading-none text-ink-900">{uptime}%</span>
            <span className="mt-0.5 text-2xs font-semibold uppercase tracking-wide text-emerald-600">Operational</span>
          </div>
        </div>

        <div className="w-full flex-1 space-y-2">
          {[
            { label: 'Uptime', pct: uptime, hours: uptimeHours, color: CHART.brand },
            { label: 'Downtime', pct: downtime, hours: totalHours - uptimeHours, color: CHART.neutral },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-medium text-ink-600">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: r.color }} />
                {r.label}
              </span>
              <span className="tnum text-xs font-bold text-ink-900">
                {r.pct}%<span className="ml-1 font-medium text-ink-400">{r.hours}h</span>
              </span>
            </div>
          ))}
          <div className="mt-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-2xs font-semibold text-brand-700">
            {uptimeHours}h online of {totalHours}h monitored
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CameraUptimeChart;
