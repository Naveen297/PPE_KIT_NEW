import { useMemo } from 'react';
import { ScanEye, ShieldCheck, ShieldAlert, Gauge } from 'lucide-react';
import { usePPEStats } from '@/hooks';
import { StatCard } from '@/components/ui';
import { computeKpiTrends } from '@/lib/kpi';
import PPEBreakdownRow from './PPEBreakdownRow';

const ACCENTS = {
  brand: { iconBg: 'bg-brand-50', iconText: 'text-brand-600', stroke: '#2459eb', gradientId: 'spark-brand' },
  emerald: { iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', stroke: '#16a34a', gradientId: 'spark-emerald' },
  rose: { iconBg: 'bg-rose-50', iconText: 'text-rose-600', stroke: '#ef4444', gradientId: 'spark-rose' },
  violet: { iconBg: 'bg-violet-50', iconText: 'text-violet-600', stroke: '#7c3aed', gradientId: 'spark-violet' },
};

/**
 * StatsSection — KPI summary row + per-item PPE breakdown.
 * Headline values come straight from `stats` (unchanged); deltas and sparklines
 * are derived from `detections` via computeKpiTrends.
 */
const StatsSection = ({ stats, detections = [] }) => {
  const itemCounts = usePPEStats(detections);
  const trends = useMemo(() => computeKpiTrends(detections), [detections]);

  const cards = [
    {
      label: 'Total Detections',
      value: Number(stats.total).toLocaleString('en-IN'),
      icon: <ScanEye className="h-5 w-5" />,
      accent: ACCENTS.brand,
      delta: trends.total.deltaPct,
      goodWhenUp: true,
      series: trends.total.series,
    },
    {
      label: 'Compliant',
      value: Number(stats.compliant).toLocaleString('en-IN'),
      icon: <ShieldCheck className="h-5 w-5" />,
      accent: ACCENTS.emerald,
      delta: trends.compliant.deltaPct,
      goodWhenUp: true,
      series: trends.compliant.series,
    },
    {
      label: 'Violations',
      value: Number(stats.violations).toLocaleString('en-IN'),
      icon: <ShieldAlert className="h-5 w-5" />,
      accent: ACCENTS.rose,
      delta: trends.violations.deltaPct,
      goodWhenUp: false,
      series: trends.violations.series,
    },
    {
      label: 'Compliance Rate',
      value: `${stats.complianceRate}%`,
      icon: <Gauge className="h-5 w-5" />,
      accent: ACCENTS.violet,
      delta: trends.complianceRate.deltaPoints,
      goodWhenUp: true,
      series: trends.complianceRate.series,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
      <PPEBreakdownRow itemCounts={itemCounts} />
    </div>
  );
};

export default StatsSection;
