import mahindraLogo from '@/assets/MAI_Logo.png';
import NavTabs from './NavTabs';

/**
 * Application header — glassmorphism design, compact single-row layout.
 *
 * @param {Object}   props
 * @param {() => void} props.onDownloadReport  - Opens the report download modal.
 * @param {'dashboard'|'live'} props.currentView - Active view key.
 * @param {(view: string) => void} props.onNavigate - Navigation callback.
 */
const Header = ({ onDownloadReport, currentView, onNavigate }) => {

  return (
    <header
      style={{
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.25)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.3)',
      }}
      className="rounded-2xl"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">

        {/* ── Brand ── */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 flex-shrink-0 focus:outline-none group"
          aria-label="Go to dashboard"
        >
          {/* Logo pill */}
          <div
            style={{
              background: 'rgba(255,255,255,1)',
              border: '1px solid rgba(0,0,0,0.1)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
            className="flex items-center justify-center rounded-lg p-1.5 h-9 w-auto"
          >
            <img
              src={mahindraLogo}
              alt="Mahindra AI Logo"
              className="h-6 w-auto object-contain"
            />
          </div>

          {/* Title + badge */}
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold text-gray-900 leading-none tracking-tight">
              SafetyAI
            </h1>
            <span
              style={{
                background: 'rgba(59,130,246,0.12)',
                border: '1px solid rgba(59,130,246,0.3)',
              }}
              className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold text-blue-700 uppercase tracking-widest"
            >
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
          <NavTabs currentView={currentView} onNavigate={onNavigate} />

          {/* Report button */}
          <button
            id="download-report-btn"
            onClick={onDownloadReport}
            title="Download Report"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.85) 0%, rgba(37,99,235,0.9) 100%)',
              border: '1px solid rgba(255,255,255,0.25)',
              boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
            }}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-white text-xs font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 whitespace-nowrap"
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
