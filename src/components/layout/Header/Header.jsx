import mahindraLogo from '@/assets/MAI_Logo.png';
import { useApiResource } from '@/hooks';
import { getDateTime } from '@/api';
import NavTabs from './NavTabs';

/**
 * Normalise whatever shape `/datetime` returns into a short display string.
 * Tolerates a bare string, `{ datetime }`, `{ timestamp }`, or `{ date, time }`.
 * Returns `null` when nothing usable is present so the caller can fall back.
 */
const formatStamp = (raw) => {
  if (!raw) return null;
  const p = raw.data ?? raw;

  let value =
    typeof p === 'string'
      ? p
      : p.datetime ?? p.dateTime ?? p.timestamp ?? p.now ?? p.current ?? null;

  if (!value && typeof p === 'object' && (p.date || p.time)) {
    return [p.date, p.time].filter(Boolean).join(' ');
  }
  if (!value) return null;

  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return String(value);
};

/**
 * Application header — glassmorphism design, compact single-row layout.
 *
 * @param {Object}   props
 * @param {() => void} props.onDownloadReport  - Opens the report download modal.
 * @param {'dashboard'|'live'} props.currentView - Active view key.
 * @param {(view: string) => void} props.onNavigate - Navigation callback.
 */
const Header = ({ onDownloadReport, currentView, onNavigate }) => {
  const { data, loading, error } = useApiResource(getDateTime);
  const stamp = formatStamp(data);

  return (
    <header className="sticky top-2 z-40 rounded-2xl border border-ink-200/70 bg-white/85 shadow-card backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">

        {/* ── Brand ── */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 flex-shrink-0 focus:outline-none group"
          aria-label="Go to dashboard"
        >
          {/* Logo pill */}
          <div className="flex items-center justify-center rounded-lg p-1.5 h-9 w-auto bg-white ring-1 ring-ink-200 shadow-xs">
            <img
              src={mahindraLogo}
              alt="Mahindra AI Logo"
              className="h-6 w-auto object-contain"
            />
          </div>

          {/* Title + badge */}
          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg font-extrabold text-ink-900 leading-none tracking-tight">
              SafetyAI
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold text-brand-700 uppercase tracking-widest bg-brand-50 ring-1 ring-brand-100">
              PPE Detection
            </span>

          </div>
        </button>

        {/* ── Live indicator (mobile-visible shortcut) ── */}
        {currentView === 'live' && (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600 sm:hidden">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
        )}

        {/* ── Controls ── */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Last updated stamp */}
          <div className="hidden md:flex flex-col items-end rounded-lg border border-ink-200/70 bg-white/70 px-2.5 py-1 leading-tight shadow-xs">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-ink-400">
              Last Updated
            </span>
            <span
              className={`tnum text-[11px] font-bold ${
                error || (!loading && !stamp) ? 'text-red-500' : 'text-ink-700'
              }`}
            >
              {loading ? 'Loading…' : stamp ?? 'Unable to fetch'}
            </span>
          </div>

          <NavTabs currentView={currentView} onNavigate={onNavigate} />

          {/* Report button */}
          <button
            id="download-report-btn"
            onClick={onDownloadReport}
            title="Download Report"
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-brand-600 text-white text-xs font-semibold shadow-xs transition-all duration-200 hover:bg-brand-700 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Report</span>
          </button>


        </div>
      </div>
    </header>
  );
};

export default Header;
