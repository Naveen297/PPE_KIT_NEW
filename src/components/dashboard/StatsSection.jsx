import { ScanEye, ShieldAlert } from 'lucide-react';
import { StatCard, DataState } from '@/components/ui';
import PPEBreakdownRow from './PPEBreakdownRow';

const ACCENTS = {
  brand: { iconBg: 'bg-brand-50', iconText: 'text-brand-600', stroke: '#2459eb', gradientId: 'spark-brand' },
  emerald: { iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', stroke: '#16a34a', gradientId: 'spark-emerald' },
  rose: { iconBg: 'bg-rose-50', iconText: 'text-rose-600', stroke: '#ef4444', gradientId: 'spark-rose' },
  violet: { iconBg: 'bg-violet-50', iconText: 'text-violet-600', stroke: '#7c3aed', gradientId: 'spark-violet' },
};

const EMPTY_BREAKDOWN = { helmet: 0, gloves: 0, apron: 0, mobile: 0, shoes: 0, goggles: 0 };

const num = (v) => Number(v ?? 0).toLocaleString('en-IN');

/** Shimmer placeholder for a KPI card while stats load. */
const CardSkeleton = () => (
  <div className="rounded-xl border border-ink-200/70 bg-white p-3.5 shadow-card">
    <div className="flex items-center gap-2.5">
      <div className="skeleton h-9 w-9 rounded-lg" />
      <div className="skeleton h-3 w-24 rounded" />
    </div>
    <div className="skeleton mt-3 h-7 w-20 rounded" />
  </div>
);

/**
 * StatsSection — KPI summary row + per-item PPE breakdown, driven by the
 * `/api/v1/dashboard/stats` payload. Purely presentational: data, loading and
 * error are owned by the parent so the page can react to connection health.
 *
 * @param {Object} props
 * @param {Object|null} props.stats - Dashboard stats payload (or null).
 * @param {boolean} props.loading
 * @param {Error|null} props.error
 * @param {() => void} [props.onRetry]
 */
const StatsSection = ({ stats, loading, error, onRetry }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="skeleton h-32 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-ink-200/70 bg-white p-5 shadow-card">
        <DataState error={error} onRetry={onRetry} className="min-h-[140px]">
          {null}
        </DataState>
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Detections',
      value: num(stats?.totalDetections),
      icon: <ScanEye className="h-5 w-5" />,
      accent: ACCENTS.brand,
    },
    {
      label: 'Violations',
      value: num(stats?.violations),
      icon: <ShieldAlert className="h-5 w-5" />,
      accent: ACCENTS.rose,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
      <PPEBreakdownRow itemCounts={stats?.ppeBreakdown ?? EMPTY_BREAKDOWN} />
    </div>
  );
};

export default StatsSection;
