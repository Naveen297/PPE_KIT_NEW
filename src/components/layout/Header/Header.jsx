import { usePlant } from '@/hooks';
import mahindraLogo from '@/assets/MAI_Logo.png';
import NavTabs from './NavTabs';
import PlantSelector from './PlantSelector';

/**
 * Application header — branding, navigation, and report download action.
 *
 * @param {Object}   props
 * @param {() => void} props.onDownloadReport  - Opens the report download modal.
 * @param {'dashboard'|'live'} props.currentView - Active view key.
 * @param {(view: string) => void} props.onNavigate - Navigation callback.
 */
const Header = ({ onDownloadReport, currentView, onNavigate }) => {
  const { currentPlant } = usePlant();

  return (
    <header className="border border-gray-200 shadow-lg bg-gradient-to-r from-white via-gray-50 to-white rounded-2xl">
      <div className="flex flex-col items-center justify-between gap-5 p-6 lg:flex-row">
        {/* Brand */}
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => onNavigate('dashboard')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('dashboard')}
          aria-label="Go to dashboard"
        >
          <div className="flex justify-center items-center bg-white rounded-xl shadow-md p-1.5 border border-gray-200">
            <img src={mahindraLogo} alt="Mahindra AI Logo" className="object-contain w-auto h-9" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent lg:text-3xl bg-gradient-to-r from-gray-800 via-gray-900 to-blue-900 bg-clip-text">
              SafetyAI
            </h1>
            <p className="flex items-center gap-2 mt-1 text-sm font-medium text-gray-600">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold">
                PPE Detection
              </span>
              <span className="text-xs text-gray-400 hidden sm:inline">{currentPlant.name}</span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <NavTabs currentView={currentView} onNavigate={onNavigate} />

          <button
            id="download-report-btn"
            onClick={onDownloadReport}
            className="flex items-center gap-2 px-5 py-3 text-white transition-all duration-200 shadow-sm bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:shadow-md hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden text-sm font-semibold md:inline">Report</span>
          </button>

          <PlantSelector />
        </div>
      </div>
    </header>
  );
};

export default Header;
