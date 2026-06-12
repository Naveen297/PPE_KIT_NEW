import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Radio,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { clsx } from 'clsx';
import { ConfidenceBar, Card, CardHeader, DataState } from '@/components/ui';
import { useDetections, useDetectionStream } from '@/hooks';

const PAGE_SIZE = 6;

/** Map a detection to a severity/status badge. */
const getStatusMeta = (d) => {
  if (d.status === 'compliant') {
    return { label: 'Compliant', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200', compliant: true };
  }
  const missing = d.missingItems?.length ?? 0;
  if (missing >= 3) return { label: 'Critical', className: 'bg-rose-50 text-rose-700 ring-rose-200' };
  if (missing === 2) return { label: 'High', className: 'bg-orange-50 text-orange-700 ring-orange-200' };
  return { label: 'Medium', className: 'bg-amber-50 text-amber-700 ring-amber-200' };
};

const formatCompactTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return { date: timestamp, time: '' };
  return {
    date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
  };
};

// Server-supported status filter (maps directly to the `status` query param).
const STATUS_FILTERS = [
  { id: 'violation', label: 'Violations' },
  { id: 'all', label: 'All' },
  { id: 'compliant', label: 'Compliant' },
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
 * DetectionsTable — server-paginated detections log backed by
 * `GET /api/v1/detections`, with live new-violation rows pushed in via SSE.
 *
 * @param {Object} props
 * @param {(detection: object) => void} props.onViewDetails
 */
const DetectionsTable = ({ onViewDetails }) => {
  const [status, setStatus] = useState('violation');
  const [sort, setSort] = useState({ key: 'time', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [liveRows, setLiveRows] = useState([]);

  const { detections, pagination, loading, error, refetch } = useDetections({
    status,
    page,
    limit: PAGE_SIZE,
    sortBy: sort.key,
    sortOrder: sort.dir.toUpperCase(),
  });

  // Live rows only make sense on the first page of a time-desc violation view.
  const liveEligible =
    page === 1 && sort.key === 'time' && sort.dir === 'desc' && status !== 'compliant';

  const { connected } = useDetectionStream(
    (detection) => {
      if (!liveEligible) return;
      setLiveRows((prev) => {
        if (prev.some((r) => r.id === detection.id)) return prev;
        return [detection, ...prev].slice(0, PAGE_SIZE);
      });
    },
    { enabled: true },
  );

  // Reset the live buffer whenever the query that produced it changes.
  useEffect(() => {
    setLiveRows([]);
  }, [status, sort.key, sort.dir, page]);

  // Merge live rows on top of the server page, de-duplicated by id.
  const rows = useMemo(() => {
    if (!liveEligible || liveRows.length === 0) return detections;
    const serverIds = new Set(detections.map((d) => d.id));
    const fresh = liveRows.filter((r) => !serverIds.has(r.id));
    return [...fresh, ...detections].slice(0, PAGE_SIZE);
  }, [liveEligible, liveRows, detections]);

  const total = pagination?.total ?? 0;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  const pageAvgConfidence = useMemo(() => {
    if (rows.length === 0) return 0;
    const sum = rows.reduce((s, d) => s + Number.parseFloat(d.confidence || 0), 0);
    return (sum / rows.length).toFixed(1);
  }, [rows]);

  const handleSort = (key) => {
    setPage(1);
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));
  };
  const handleStatus = (id) => { setStatus(id); setPage(1); };

  const statusLabel = STATUS_FILTERS.find((f) => f.id === status)?.label ?? 'Records';

  return (
    <Card flush className="overflow-hidden">
      <div className="flex flex-col gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
        <CardHeader
          title="PPE Detection Log"
          subtitle={`${total} ${statusLabel.toLowerCase()} on record`}
          icon={<ShieldAlert className="h-[18px] w-[18px]" />}
          iconClassName="bg-rose-50 text-rose-600"
          className="flex-1"
        />
        <div className="grid grid-cols-3 gap-2 xl:w-auto">
          <SummaryChip label="Total" value={total} tone="neutral" />
          <SummaryChip label="Page" value={`${page} / ${totalPages}`} tone="brand" />
          <SummaryChip label="Avg conf." value={`${pageAvgConfidence}%`} tone="rose" />
        </div>
      </div>

      {/* Status filter + live indicator */}
      <div className="flex items-center justify-between gap-2 border-t border-ink-100 px-5 py-3">
        <div className="flex items-center gap-1 rounded-lg bg-ink-100/70 p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => handleStatus(f.id)}
              className={clsx(
                'rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
                status === f.id ? 'bg-white text-brand-700 shadow-xs' : 'text-ink-500 hover:text-ink-700',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span
          className={clsx(
            'inline-flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide',
            connected ? 'text-emerald-600' : 'text-ink-400',
          )}
          title={connected ? 'Live updates connected' : 'Live updates offline'}
        >
          <Radio className={clsx('h-3.5 w-3.5', connected && 'animate-pulse')} aria-hidden="true" />
          {connected ? 'Live' : 'Offline'}
        </span>
      </div>

      {/* Table */}
      <div className="min-h-[280px] max-h-[480px] overflow-auto scroll-slim border-t border-ink-100">
        <DataState
          loading={loading && rows.length === 0}
          error={error}
          onRetry={refetch}
          empty={rows.length === 0}
          className="min-h-[280px]"
          emptyState={
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 px-4 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold text-ink-700">No records to show</p>
              <p className="text-xs text-ink-400">Nothing matches this filter right now.</p>
            </div>
          }
        >
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
              {rows.map((d) => {
                const meta = getStatusMeta(d);
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
                      <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-2xs font-bold ring-1', meta.className)}>
                        {meta.compliant ? (
                          <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        )}
                        {meta.label}
                      </span>
                    </td>
                    <td className="border-b border-ink-100 px-4 py-3">
                      <div className="flex max-w-xs flex-wrap gap-1">
                        {missing.length === 0 ? (
                          <span className="text-2xs text-ink-300">—</span>
                        ) : (
                          missing.map((item) => (
                            <span key={item} className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-2xs font-semibold text-rose-700 ring-1 ring-rose-100">
                              {item.replace('Safety ', '')}
                            </span>
                          ))
                        )}
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
              })}
            </tbody>
          </table>
        </DataState>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3">
          <p className="text-xs text-ink-500">
            Page <span className="tnum font-semibold text-ink-700">{page}</span> of{' '}
            <span className="tnum font-semibold text-ink-700">{totalPages}</span>
            <span className="ml-2 hidden text-ink-400 sm:inline">· {total} total</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="tnum px-2 text-xs font-semibold text-ink-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
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
