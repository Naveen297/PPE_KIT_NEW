// import { createContext, useContext, useState, useEffect } from 'react';
// import { PLANTS, APP_CONFIG } from '../constants';
// import { generateHistoricalData, generateDetection } from '../utils/dataGenerator';

// const PlantContext = createContext();

// export const usePlant = () => {
//   const context = useContext(PlantContext);
//   if (!context) {
//     throw new Error('usePlant must be used within a PlantProvider');
//   }
//   return context;
// };

// export const PlantProvider = ({ children }) => {
//   const [selectedPlant, setSelectedPlant] = useState(APP_CONFIG.defaultPlant);
//   const [detections, setDetections] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // Initialize data when plant changes
//   useEffect(() => {
//     setIsLoading(true);

//     // Simulate loading delay for better UX
//     setTimeout(() => {
//       const historicalData = generateHistoricalData(selectedPlant, 50);
//       setDetections(historicalData);
//       setIsLoading(false);
//     }, 500);
//   }, [selectedPlant]);

//   // Simulate real-time updates
//   useEffect(() => {
//     if (isLoading) return;

//     const interval = setInterval(() => {
//       const newDetection = generateDetection(selectedPlant);

//       setDetections(prev => {
//         const updated = [newDetection, ...prev];
//         return updated.slice(0, APP_CONFIG.maxDetections);
//       });
//     }, APP_CONFIG.refreshInterval);

//     return () => clearInterval(interval);
//   }, [selectedPlant, isLoading]);

//   const changePlant = (plantId) => {
//     setSelectedPlant(plantId);
//   };

//   const getCurrentPlant = () => {
//     return PLANTS.find(p => p.id === selectedPlant) || PLANTS[0];
//   };

//   const value = {
//     selectedPlant,
//     changePlant,
//     currentPlant: getCurrentPlant(),
//     detections,
//     isLoading,
//     plants: PLANTS
//   };

//   return <PlantContext.Provider value={value}>{children}</PlantContext.Provider>;
// };

import { createContext, useContext, useState, useEffect } from 'react';
import { PLANTS, APP_CONFIG } from '../constants';
import { generateHistoricalData, generateDetection } from '../utils/dataGenerator';

const PlantContext = createContext();

export const usePlant = () => {
  const context = useContext(PlantContext);
  if (!context) {
    throw new Error('usePlant must be used within a PlantProvider');
  }
  return context;
};

export const PlantProvider = ({ children }) => {
  const [selectedPlant, setSelectedPlant] = useState(APP_CONFIG.defaultPlant);
  const [detections, setDetections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    setTimeout(() => {
      const historicalData = generateHistoricalData(selectedPlant, 50);
      setDetections(historicalData);
      setIsLoading(false);
    }, 500);
  }, [selectedPlant]);

  useEffect(() => {
    if (isLoading) return;

    const interval = setInterval(() => {
      const newDetection = generateDetection(selectedPlant);

      setDetections(prev => {
        const updated = [newDetection, ...prev];
        return updated.slice(0, APP_CONFIG.maxDetections);
      });
    }, APP_CONFIG.refreshInterval);

    return () => clearInterval(interval);
  }, [selectedPlant, isLoading]);

  const changePlant = (plantId) => {
    setSelectedPlant(plantId);
  };

  const getCurrentPlant = () => {
    return PLANTS.find(p => p.id === selectedPlant) || PLANTS[0];
  };

  const value = {
    selectedPlant,
    changePlant,
    currentPlant: getCurrentPlant(),
    detections,
    isLoading,
    plants: PLANTS
  };

  return <PlantContext.Provider value={value}>{children}</PlantContext.Provider>;
};