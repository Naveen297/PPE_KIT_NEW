import { useMemo } from 'react';
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ListChecks, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, EmptyState } from '@/components/ui';
import { CHART, hoverCursor } from '@/lib/chart/theme';
import ChartTooltip from '@/lib/chart/ChartTooltip';

const ITEM_LABELS = {
  'Safety Helmet': 'No Hard Hat',
  'Safety Gloves': 'No Gloves',
  'Safety Vest': 'No Safety Vest',
  'Safety Boots': 'No Safety Boots',
  'Safety Goggles': 'No Goggles',
  'Face Mask': 'No Face Mask',
};

const PALETTE = ['#2459eb', '#3b76f6', '#0ea5e9', '#22b8cf', '#14b8a6', '#5e8bf7'];

/**
 * IncidentTypeChart — bar chart of violation counts by missing PPE type, so the
 * most common safety gap is obvious at a glance.
 */
const IncidentTypeChart = ({ detections = [] }) => {
  const data = useMemo(() => {
    const counts = {};
    detections
      .filter((d) => d.status === 'violation')
      .forEach((d) => {
        d.missingItems?.forEach((item) => {
          const label = ITEM_LABELS[item] ?? item;
          counts[label] = (counts[label] ?? 0) + 1;
        });
      });
    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [detections]);

  const hasData = data.length > 0;

  return (
    <Card>
      <CardHeader
        title="Incident Types"
        subtitle="Most frequent PPE gaps"
        icon={<ListChecks className="h-[18px] w-[18px]" />}
      />
      <div className="mt-4 h-[248px] w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 18, right: 8, bottom: 0, left: -18 }} barCategoryGap="22%">
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
                {data.map((entry, i) => (
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
        ) : (
          <EmptyState icon={CheckCircle2} title="No violations recorded" description="No PPE gaps detected for this plant." className="h-full" />
        )}
      </div>
    </Card>
  );
};

export default IncidentTypeChart;
