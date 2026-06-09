import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { clsx } from 'clsx';
import { ConfidenceBar, Card, CardHeader } from '@/components/ui';

const PAGE_SIZE = 6;

const getRiskMeta = (missingCount) => {
  if (missingCount >= 3) return { label: 'Critical', rank: 3, className: 'bg-rose-50 text-rose-700 ring-rose-200' };
  if (missingCount === 2) return { label: 'High', rank: 2, className: 'bg-orange-50 text-orange-700 ring-orange-200' };
  return { label: 'Medium', rank: 1, className: 'bg-amber-50 text-amber-700 ring-amber-200' };
};

const formatCompactTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return { date: timestamp, time: '' };
  return {
    date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
  };
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'critical', label: 'Critical' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
];

const SummaryChip = ({ label, value, tone }) => (
  <div
    className={clsx(
      'rounded-xl border px-3 py-2',
      tone === 'rose' && 'border-rose-100 bg-rose-50',
      tone === 'brand' && 'border-brand-100 bg-brand-50',
      tone === 'neutral' && 'border-ink-200/70 bg-ink-50/60',
    )}
  >
    <p className={clsx('text-2xs font-bold uppercase tracking-wide',
      tone === 'rose' ? 'text-rose-500' : tone === 'brand' ? 'text-brand-500' : 'text-ink-400')}>
      {label}
    </p>
    <p className={clsx('tnum text-sm font-bold',
      tone === 'rose' ? 'text-rose-700' : tone === 'brand' ? 'text-brand-700' : 'text-ink-900')}>
      {value}
    </p>
  </div>
);

/** Sortable column header button. */
const SortHeader = ({ label, columnKey, sort, onSort, align = 'left', className }) => {
  const active = sort.key === columnKey;
  return (
    <th className={clsx('px-4 py-3', align === 'center' ? 'text-center' : 'text-left', className)}>
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={clsx(
          'inline-flex items-center gap-1 text-2xs font-bold uppercase tracking-wider transition-colors',
          active ? 'text-brand-600' : 'text-ink-400 hover:text-ink-600',
          align === 'center' && 'justify-center',
        )}
      >
        {label}
        {active ? (
          <ChevronDown className={clsx('h-3.5 w-3.5 transition-transform', sort.dir === 'asc' && 'rotate-180')} aria-hidden="true" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-60" aria-hidden="true" />
        )}
      </button>
    </th>
  );
};

/**
 * DetectionsTable — enterprise data table of PPE violations with sticky header,
 * sortable columns, severity filtering, and pagination. Data is unchanged.
 */
const DetectionsTable = ({ detections, onViewDetails }) => {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState({ key: 'time', dir: 'desc' });
  const [page, setPage] = useState(0);

  const violations = useMemo(
    () => detections.filter((d) => d.status === 'violation'),
    [detections],
  );

  const criticalCount = useMemo(
    () => violations.filter((d) => (d.missingItems?.length ?? 0) >= 3).length,
    [violations],
  );
  const avgConfidence = useMemo(() => {
    if (violations.length === 0) return 0;
    const t = violations.reduce((s, d) => s + Number.parseFloat(d.confidence || 0), 0);
    return (t / violations.length).toFixed(1);
  }, [violations]);

  const filtered = useMemo(() => {
    if (filter === 'all') return violations;
    return violations.filter((d) => {
      const m = d.missingItems?.length ?? 0;
      if (filter === 'critical') return m >= 3;
      if (filter === 'high') return m === 2;
      return m <= 1;
    });
  }, [violations, filter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sort.dir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      switch (sort.key) {
        case 'area':
          return a.location.localeCompare(b.location) * dir;
        case 'severity':
          return ((a.missingItems?.length ?? 0) - (b.missingItems?.length ?? 0)) * dir;
        case 'confidence':
          return (Number.parseFloat(a.confidence) - Number.parseFloat(b.confidence)) * dir;
        case 'time':
        default:
          return (new Date(a.timestamp) - new Date(b.timestamp)) * dir;
      }
    });
    return arr;
  }, [filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = sorted.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const handleSort = (key) => {
    setPage(0);
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));
  };
  const handleFilter = (id) => { setFilter(id); setPage(0); };

  return (
    <Card flush className="overflow-hidden">
      <div className="flex flex-col gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
        <CardHeader
          title="PPE Violation Log"
          subtitle={`${filtered.length} of ${violations.length} violation events`}
          icon={<ShieldAlert className="h-[18px] w-[18px]" />}
          iconClassName="bg-rose-50 text-rose-600"
          className="flex-1"
        />
        <div className="grid grid-cols-3 gap-2 xl:w-auto">
          <SummaryChip label="Total" value={violations.length} tone="neutral" />
          <SummaryChip label="Critical" value={criticalCount} tone="rose" />
          <SummaryChip label="Avg conf." value={`${avgConfidence}%`} tone="brand" />
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex items-center gap-1 border-t border-ink-100 px-5 py-3">
        <div className="flex items-center gap-1 rounded-lg bg-ink-100/70 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => handleFilter(f.id)}
              className={clsx(
                'rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
                filter === f.id ? 'bg-white text-brand-700 shadow-xs' : 'text-ink-500 hover:text-ink-700',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="max-h-[480px] overflow-auto scroll-slim border-t border-ink-100">
        <table className="w-full min-w-[820px] border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-ink-50/95 backdrop-blur">
              <SortHeader label="Time" columnKey="time" sort={sort} onSort={handleSort} className="border-b border-ink-200" />
              <SortHeader label="Zone" columnKey="area" sort={sort} onSort={handleSort} className="border-b border-ink-200" />
              <SortHeader label="Severity" columnKey="severity" sort={sort} onSort={handleSort} className="border-b border-ink-200" />
              <th className="border-b border-ink-200 px-4 py-3 text-left text-2xs font-bold uppercase tracking-wider text-ink-400">Missing PPE</th>
              <SortHeader label="Confidence" columnKey="confidence" sort={sort} onSort={handleSort} className="border-b border-ink-200" />
              <th className="border-b border-ink-200 px-4 py-3 text-center text-2xs font-bold uppercase tracking-wider text-ink-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                      <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <p className="text-sm font-semibold text-ink-700">No violations to show</p>
                    <p className="text-xs text-ink-400">All workers are compliant for this filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              pageRows.map((d) => {
                const risk = getRiskMeta(d.missingItems?.length ?? 0);
                const ts = formatCompactTimestamp(d.timestamp);
                const missing = d.missingItems ?? [];
                return (
                  <tr key={d.id} className="group transition-colors hover:bg-brand-50/40">
                    <td className="whitespace-nowrap border-b border-ink-100 px-4 py-3">
                      <div className="font-semibold text-ink-900">{ts.date}</div>
                      <div className="text-2xs text-ink-400">{ts.time}</div>
                    </td>
                    <td className="border-b border-ink-100 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-ink-300" aria-hidden="true" />
                        <span className="font-medium text-ink-700">{d.location}</span>
                      </div>
                    </td>
                    <td className="border-b border-ink-100 px-4 py-3">
                      <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-2xs font-bold ring-1', risk.className)}>
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        {risk.label}
                      </span>
                    </td>
                    <td className="border-b border-ink-100 px-4 py-3">
                      <div className="flex max-w-xs flex-wrap gap-1">
                        {missing.map((item) => (
                          <span key={item} className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-2xs font-semibold text-rose-700 ring-1 ring-rose-100">
                            {item.replace('Safety ', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="border-b border-ink-100 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ConfidenceBar value={d.confidence} size="sm" showLabel={false} />
                        <span className="tnum w-11 text-right text-xs font-bold text-ink-800">{d.confidence}%</span>
                      </div>
                    </td>
                    <td className="border-b border-ink-100 px-4 py-3 text-center">
                      <button
                        onClick={() => onViewDetails(d)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-brand-100 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40"
                        title="View details"
                        aria-label={`View details for detection ${d.id}`}
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sorted.length > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3">
          <p className="text-xs text-ink-500">
            Showing{' '}
            <span className="tnum font-semibold text-ink-700">
              {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, sorted.length)}
            </span>{' '}
            of <span className="tnum font-semibold text-ink-700">{sorted.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="tnum px-2 text-xs font-semibold text-ink-600">
              {safePage + 1} / {pageCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DetectionsTable;
