import { useMemo } from 'react';
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MapPin, Building2 } from 'lucide-react';
import { Card, CardHeader, EmptyState } from '@/components/ui';
import { CHART, hoverCursor } from '@/lib/chart/theme';
import ChartTooltip from '@/lib/chart/ChartTooltip';

/**
 * AreaWiseIncidentsChart — horizontal bar chart of violations per zone.
 * Highest-incident zone is emphasized so the risk hotspot reads instantly.
 */
const AreaWiseIncidentsChart = ({ detections = [], plantZones = [] }) => {
  const data = useMemo(() => {
    const counts = {};
    plantZones.forEach((z) => { counts[z] = 0; });
    detections
      .filter((d) => d.status === 'violation')
      .forEach((d) => {
        counts[d.location] = (counts[d.location] ?? 0) + 1;
      });
    return Object.entries(counts)
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [detections, plantZones]);

  const max = Math.max(...data.map((d) => d.count), 0);
  const hasData = data.some((d) => d.count > 0);

  return (
    <Card>
      <CardHeader
        title="Violations by Zone"
        subtitle="Top hotspots across plant areas"
        icon={<MapPin className="h-[18px] w-[18px]" />}
      />
      <div className="mt-4 h-[248px] w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
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
                {data.map((entry, i) => (
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
        ) : (
          <EmptyState icon={Building2} title="No zone violations" description="All monitored areas are compliant." className="h-full" />
        )}
      </div>
    </Card>
  );
};

export default AreaWiseIncidentsChart;
