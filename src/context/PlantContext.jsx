import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PLANTS, APP_CONFIG } from '@/constants';
import { generateHistoricalData, generateDetection } from '@/utils/dataGenerator';

const PlantContext = createContext(null);

/**
 * usePlant — Access plant data and detection state.
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
 * PlantProvider — Supplies plant selection state, detections, and real-time
 * detection simulation to the component tree.
 */
export const PlantProvider = ({ children }) => {
  const [selectedPlant, setSelectedPlant] = useState(APP_CONFIG.defaultPlant);
  const [detections, setDetections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load historical data when plant changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setDetections(generateHistoricalData(selectedPlant, 50));
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedPlant]);

  // Simulate real-time detection stream
  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      setDetections((prev) => {
        const updated = [generateDetection(selectedPlant), ...prev];
        return updated.slice(0, APP_CONFIG.maxDetections);
      });
    }, APP_CONFIG.refreshInterval);
    return () => clearInterval(interval);
  }, [selectedPlant, isLoading]);

  const changePlant = useCallback((plantId) => setSelectedPlant(plantId), []);

  const currentPlant = PLANTS.find((p) => p.id === selectedPlant) ?? PLANTS[0];

  const value = {
    selectedPlant,
    changePlant,
    currentPlant,
    detections,
    isLoading,
    plants: PLANTS,
  };

  return <PlantContext.Provider value={value}>{children}</PlantContext.Provider>;
};