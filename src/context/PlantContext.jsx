import { createContext, useContext, useState, useCallback } from 'react';
import { PLANTS, APP_CONFIG } from '@/constants';

const PlantContext = createContext(null);

/**
 * usePlant — Access plant selection state.
 * Must be used within a `<PlantProvider>`.
 */
export const usePlant = () => {
  const context = useContext(PlantContext);
  if (!context) {
    throw new Error('usePlant must be used within a PlantProvider');
  }
  return context;
};

/**
 * PlantProvider — Supplies plant selection metadata to the component tree.
 *
 * Detection data is no longer mocked here; every view now reads live data
 * straight from the backend via the API hooks (`@/hooks`, `@/api`).
 */
export const PlantProvider = ({ children }) => {
  const [selectedPlant, setSelectedPlant] = useState(APP_CONFIG.defaultPlant);

  const changePlant = useCallback((plantId) => setSelectedPlant(plantId), []);

  const currentPlant = PLANTS.find((p) => p.id === selectedPlant) ?? PLANTS[0];

  const value = {
    selectedPlant,
    changePlant,
    currentPlant,
    plants: PLANTS,
  };

  return <PlantContext.Provider value={value}>{children}</PlantContext.Provider>;
};
