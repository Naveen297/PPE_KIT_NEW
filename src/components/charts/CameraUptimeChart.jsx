import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';
import { Video } from 'lucide-react';
import { Card, CardHeader, DataState } from '@/components/ui';
import { useApiResource } from '@/hooks';
import { getCameraUptime } from '@/api';
import { CHART } from '@/lib/chart/theme';

const PERIOD_LABEL = { daily: 'last 24 hours', weekly: 'last 7 days', monthly: 'last 30 days' };

/**
 * CameraUptimeChart — radial gauge of camera availability from
 * `GET /api/v1/dashboard/charts/camera-uptime`.
 *
 * @param {Object} props
 * @param {'daily'|'weekly'|'monthly'} [props.period='monthly']
 */
const CameraUptimeChart = ({ period = 'monthly' }) => {
  const { data, loading, error, refetch } = useApiResource(
    (signal) => getCameraUptime(period, signal),
    [period],
  );

  const uptime = Number(data?.uptimePercent ?? 0);
  const downtime = Number(data?.downtimePercent ?? 0);
  const totalHours = Number(data?.totalHours ?? 0);
  const uptimeHours = Number(data?.uptimeHours ?? 0);
  const downtimeHours = Number(data?.downtimeHours ?? Math.max(totalHours - uptimeHours, 0));
  const onlineCameras = data?.onlineCameras ?? 0;
  const totalCameras = data?.totalCameras ?? 0;

  const gauge = [{ name: 'Uptime', value: uptime, fill: CHART.brand }];

  return (
    <Card>
      <CardHeader
        title="Camera Uptime"
        subtitle={`System availability · ${PERIOD_LABEL[period] ?? period}`}
        icon={<Video className="h-[18px] w-[18px]" />}
      />
      <div className="mt-4 min-h-[150px] flex-1">
        <DataState loading={loading} error={error} onRetry={refetch} className="min-h-[150px]">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div className="relative h-[150px] w-[150px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="74%"
                  outerRadius="100%"
                  data={gauge}
                  startAngle={90}
                  endAngle={-270}
                  barSize={14}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#eef1f6' }} animationDuration={750} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="tnum font-display text-2xl font-extrabold leading-none text-ink-900">{uptime}%</span>
                <span className="mt-0.5 text-2xs font-semibold uppercase tracking-wide text-emerald-600">
                  {onlineCameras}/{totalCameras} online
                </span>
              </div>
            </div>

            <div className="w-full flex-1 space-y-2">
              {[
                { label: 'Uptime', pct: uptime, hours: uptimeHours, color: CHART.brand },
                { label: 'Downtime', pct: downtime, hours: downtimeHours, color: CHART.neutral },
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
        </DataState>
      </div>
    </Card>
  );
};

export default CameraUptimeChart;
