import { useState, useCallback } from 'react';
import { usePlant } from '@/hooks';
import { useClickOutside } from '@/hooks';

/**
 * PlantSelector — Dropdown for switching between plant locations.
 * Manages its own open/close state and uses the `useClickOutside` hook.
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
        className="flex items-center gap-3 px-5 py-3 bg-white rounded-xl border-2 border-gray-300 shadow-sm hover:border-blue-500 transition-all min-w-[180px]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex-1 text-left">
          <div className="text-xs font-medium text-gray-500">Plant</div>
          <div className="text-sm font-semibold text-gray-800 truncate">{currentPlant.code}</div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-[9999] overflow-hidden"
        >
          <div className="p-2">
            {plants.map((plant) => (
              <button
                key={plant.id}
                role="option"
                aria-selected={currentPlant.id === plant.id}
                onClick={() => handleSelect(plant.id)}
                className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                  currentPlant.id === plant.id
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="text-sm font-semibold">{plant.name}</div>
                <div className={`text-xs mt-0.5 ${currentPlant.id === plant.id ? 'text-blue-200' : 'text-gray-400'}`}>
                  {plant.location}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantSelector;
