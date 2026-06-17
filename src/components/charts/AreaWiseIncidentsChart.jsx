import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MapPin, Building2 } from 'lucide-react';
import { Card, CardHeader, EmptyState, DataState } from '@/components/ui';
import { useApiResource } from '@/hooks';
import { getAreaWise } from '@/api';
import { CHART, hoverCursor } from '@/lib/chart/theme';
import ChartTooltip from '@/lib/chart/ChartTooltip';

/**
 * AreaWiseIncidentsChart — horizontal bar chart of violations per zone,
 * sourced from `GET /api/v1/dashboard/charts/area-wise`.
 *
 * @param {Object} props
 * @param {'daily'|'weekly'|'monthly'} [props.period='monthly']
 */
const AreaWiseIncidentsChart = ({ period = 'monthly' }) => {
  const { data, loading, error, refetch } = useApiResource(
    (signal) => getAreaWise(period, signal),
    [period],
  );

  const rows = data ?? [];
  const max = Math.max(...rows.map((d) => d.count), 0);
  const hasData = rows.some((d) => d.count > 0);

  return (
    <Card>
      <CardHeader
        title="Violations by Zone"
        subtitle="Top hotspots across plant areas"
        icon={<MapPin className="h-[18px] w-[18px]" />}
      />
      <div className="mt-4 h-[248px] w-full">
        <DataState
          loading={loading}
          error={error}
          onRetry={refetch}
          empty={!hasData}
          emptyState={
            <EmptyState icon={Building2} title="No zone violations" description="All monitored areas are compliant." className="h-full" />
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={rows}
              margin={{ top: 0, right: 28, bottom: 0, left: 4 }}
              barCategoryGap={10}
            >
              <XAxis type="number" hide domain={[0, max + Math.ceil(max * 0.15) || 1]} />
              <YAxis
                type="category"
                dataKey="area"
                width={104}
                tick={{ fill: CHART.axisLabel, fontSize: 11, fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={hoverCursor} />
              <Bar dataKey="count" name="Violations" radius={[0, 6, 6, 0]} maxBarSize={20} animationDuration={650}>
                {rows.map((entry, i) => (
                  <Cell key={i} fill={i === 0 ? CHART.brand : '#9fc0fb'} />
                ))}
                <LabelList
                  dataKey="count"
                  position="right"
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

export default AreaWiseIncidentsChart;
