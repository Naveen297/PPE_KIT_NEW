import { useState, useRef, useEffect } from 'react';
import { usePlant } from '../context/PlantContext';
import mahindraLogo from '../assets/MAI_Logo.png';

const Header = ({ onDownloadReport, currentView, onNavigate }) => {
  const { currentPlant, plants, changePlant } = usePlant();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePlantChange = (plantId) => {
    changePlant(plantId);
    setIsDropdownOpen(false);
  };

  return (
    <header className="border border-gray-200 shadow-lg bg-gradient-to-r from-white via-gray-50 to-white rounded-2xl">
      <div className="flex flex-col items-center justify-between gap-5 p-6 lg:flex-row">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="flex justify-center items-center bg-white rounded-xl shadow-md p-1.5 border border-gray-200">
            <img src={mahindraLogo} alt="Mahindra AI Logo" className="object-contain w-auto h-9" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent lg:text-3xl bg-gradient-to-r from-gray-800 via-gray-900 to-blue-900 bg-clip-text">
              SafetyAI
            </h1>
            <p className="flex items-center gap-2 mt-1 text-sm font-medium text-gray-600">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold">PPE Detection</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                currentView === 'dashboard' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('live')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                currentView === 'live' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${currentView === 'live' ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></span>
              Live Monitoring
            </button>
          </div>

          <button onClick={onDownloadReport} className="flex items-center gap-2 px-5 py-3 text-white transition-all duration-200 shadow-sm bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:shadow-md hover:scale-105">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden text-sm font-semibold md:inline">Report</span>
          </button>

          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 px-5 py-3 bg-white rounded-xl border-2 border-gray-300 shadow-sm hover:border-blue-500 transition-all min-w-[180px]">
              <div className="flex-1 text-left">
                <div className="text-xs font-medium text-gray-500">Plant</div>
                <div className="text-sm font-semibold text-gray-800 truncate">{currentPlant.code}</div>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-[9999] overflow-hidden">
                <div className="p-2">
                  {plants.map((plant) => (
                    <button key={plant.id} onClick={() => handlePlantChange(plant.id)} className={`w-full text-left px-3 py-3 rounded-lg hover:bg-gray-100 ${currentPlant.id === plant.id ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700'}`}>
                      <div className="text-sm font-semibold">{plant.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
