/**
 * NavTabs — Dashboard / Live Monitoring navigation toggle.
 *
 * @param {Object}   props
 * @param {'dashboard'|'live'} props.currentView - Active view key.
 * @param {(view: string) => void} props.onNavigate - Navigation callback.
 */
const NavTabs = ({ currentView, onNavigate }) => (
  <div className="flex items-center p-1 bg-gray-100 rounded-xl">
    <button
      id="nav-tab-dashboard"
      onClick={() => onNavigate('dashboard')}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
        currentView === 'dashboard'
          ? 'bg-white text-blue-700 shadow-sm'
          : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      Dashboard
    </button>
    <button
      id="nav-tab-live"
      onClick={() => onNavigate('live')}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
        currentView === 'live'
          ? 'bg-white text-red-600 shadow-sm'
          : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          currentView === 'live' ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
        }`}
      />
      Live Monitoring
    </button>
  </div>
);

export default NavTabs;
