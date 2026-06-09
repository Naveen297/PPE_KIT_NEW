/**
 * NavTabs — Dashboard / Live Monitoring navigation toggle.
 * Light glass pill with dark readable text.
 *
 * @param {Object}   props
 * @param {'dashboard'|'live'} props.currentView - Active view key.
 * @param {(view: string) => void} props.onNavigate - Navigation callback.
 */
const NavTabs = ({ currentView, onNavigate }) => (
  <div
    style={{
      background: 'rgba(0,0,0,0.07)',
      border: '1px solid rgba(0,0,0,0.1)',
    }}
    className="flex items-center p-0.5 rounded-lg h-8"
  >
    <button
      id="nav-tab-dashboard"
      onClick={() => onNavigate('dashboard')}
      style={
        currentView === 'dashboard'
          ? {
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(0,0,0,0.1)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            }
          : {}
      }
      className={`h-7 px-3 rounded-md text-xs font-semibold transition-all duration-200 focus:outline-none ${
        currentView === 'dashboard'
          ? 'text-blue-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
      }`}
    >
      Dashboard
    </button>

    <button
      id="nav-tab-live"
      onClick={() => onNavigate('live')}
      style={
        currentView === 'live'
          ? {
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              boxShadow: '0 1px 4px rgba(239,68,68,0.12)',
            }
          : {}
      }
      className={`flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-semibold transition-all duration-200 focus:outline-none ${
        currentView === 'live'
          ? 'text-red-600'
          : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          currentView === 'live' ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
        }`}
      />
      Live
    </button>
  </div>
);

export default NavTabs;
