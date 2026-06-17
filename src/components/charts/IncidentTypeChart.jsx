import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ListChecks, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, EmptyState, DataState } from '@/components/ui';
import { useApiResource } from '@/hooks';
import { getIncidentType } from '@/api';
import { CHART, hoverCursor } from '@/lib/chart/theme';
import ChartTooltip from '@/lib/chart/ChartTooltip';

const PALETTE = ['#2459eb', '#3b76f6', '#0ea5e9', '#22b8cf', '#14b8a6', '#5e8bf7'];

/** Shorten the verbose API labels ("PPE - No Hard Hat" → "No Hard Hat"). */
const shorten = (type) => (type || '').replace(/^PPE\s*-\s*/i, '');

/**
 * IncidentTypeChart — bar chart of violation counts by missing PPE type from
 * `GET /api/v1/dashboard/charts/incident-type` (already sorted desc, count > 0).
 *
 * @param {Object} props
 * @param {'daily'|'weekly'|'monthly'} [props.period='monthly']
 */
const IncidentTypeChart = ({ period = 'monthly' }) => {
  const { data, loading, error, refetch } = useApiResource(
    (signal) => getIncidentType(period, signal),
    [period],
  );

  const rows = (data ?? []).map((d) => ({ type: shorten(d.type), count: d.count }));
  const hasData = rows.length > 0;

  return (
    <Card>
      <CardHeader
        title="Incident Types"
        subtitle="Most frequent PPE gaps"
        icon={<ListChecks className="h-[18px] w-[18px]" />}
      />
      <div className="mt-4 h-[248px] w-full">
        <DataState
          loading={loading}
          error={error}
          onRetry={refetch}
          empty={!hasData}
          emptyState={
            <EmptyState icon={CheckCircle2} title="No violations recorded" description="No PPE gaps detected for this period." className="h-full" />
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 18, right: 8, bottom: 0, left: -18 }} barCategoryGap="22%">
              <XAxis
                dataKey="type"
                tick={{ fill: CHART.axisLabel, fontSize: 10, fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: CHART.grid }}
                interval={0}
                angle={-18}
                textAnchor="end"
                height={48}
              />
              <YAxis hide allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={hoverCursor} />
              <Bar dataKey="count" name="Violations" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={650}>
                {rows.map((entry, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
                <LabelList
                  dataKey="count"
                  position="top"
                  className="tnum"
                  style={{ fill: CHART.axisLabel, fontSize: 11, fontWeight: 700 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </DataState>
      </div>
    </Card>
  );
};

export default IncidentTypeChart;
