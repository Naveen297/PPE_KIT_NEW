import { useState, useCallback } from 'react';
import { usePlant } from '@/hooks';
import { useClickOutside } from '@/hooks';

/**
 * PlantSelector — Compact glass-style dropdown for switching plant locations.
 * Dark readable text on the light glass header.
 */
const PlantSelector = () => {
  const { currentPlant, plants, changePlant } = usePlant();
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);
  const containerRef = useClickOutside(close);

  const handleSelect = useCallback(
    (plantId) => {
      changePlant(plantId);
      setIsOpen(false);
    },
    [changePlant],
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        id="plant-selector-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Switch plant"
        style={{
          background: 'rgba(0,0,0,0.07)',
          border: isOpen ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(0,0,0,0.12)',
          boxShadow: isOpen ? '0 0 0 2px rgba(59,130,246,0.15)' : 'none',
        }}
        className="flex items-center gap-2 h-8 pl-2.5 pr-2 rounded-lg transition-all duration-200 hover:bg-black/10 focus:outline-none min-w-[120px]"
      >
        {/* Factory icon */}
        <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>

        <div className="flex-1 text-left min-w-0">
          <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Plant</div>
          <div className="text-xs font-bold text-gray-800 truncate leading-none">{currentPlant.code}</div>
        </div>

        <svg
          className={`w-3 h-3 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
          }}
          className="absolute right-0 mt-1.5 w-64 rounded-xl z-[9999] overflow-hidden animate-slide-down"
        >
          {/* Dropdown header */}
          <div
            style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}
            className="px-3 py-2"
          >
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Plant</p>
          </div>

          <div className="p-1.5">
            {plants.map((plant) => {
              const isActive = currentPlant.id === plant.id;
              return (
                <button
                  key={plant.id}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(plant.id)}
                  style={
                    isActive
                      ? {
                          background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(37,99,235,0.08) 100%)',
                          border: '1px solid rgba(59,130,246,0.25)',
                        }
                      : { border: '1px solid transparent' }
                  }
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold">{plant.name}</div>
                      {plant.location && (
                        <div className={`text-[10px] mt-0.5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>
                          {plant.location}
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantSelector;
