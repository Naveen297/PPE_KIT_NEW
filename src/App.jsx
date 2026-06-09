import { useState, useCallback } from 'react';
import { PlantProvider, usePlant } from '@/context/PlantContext';
import { calculateStats } from '@/utils';

// Layout
import Header from '@/components/layout/Header/Header';

// Dashboard
import { StatsSection, DetectionsTable } from '@/components/dashboard';

// Charts
import {
  IncidentsOverTimeChart,
  AreaWiseIncidentsChart,
  RiskLevelChart,
  CameraUptimeChart,
  IncidentTypeChart,
} from '@/components/charts';

// Monitoring
import { LiveMonitoring } from '@/components/monitoring';

// Modals
import { DetectionModal, ReportDownloadModal } from '@/components/modals';

import './App.css';

/** Loading screen shown while detection data is being fetched. */
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block w-16 h-16 mb-4 border-t-4 border-b-4 border-blue-600 rounded-full animate-spin" />
      <p className="text-xl font-semibold text-gray-700">Loading Safety Dashboard...</p>
    </div>
  </div>
);

/** Inner app — consumes PlantContext. */
function AppContent() {
  const { detections, isLoading, currentPlant } = usePlant();

  const [selectedDetection, setSelectedDetection] = useState(null);
  const [showReportModal, setShowReportModal]     = useState(false);
  const [currentView, setCurrentView]             = useState('dashboard');

  // Stable handlers — prevent unnecessary child re-renders
  const handleViewDetails    = useCallback((d) => setSelectedDetection(d), []);
  const handleCloseModal     = useCallback(() => setSelectedDetection(null), []);
  const handleOpenReport     = useCallback(() => setShowReportModal(true), []);
  const handleCloseReport    = useCallback(() => setShowReportModal(false), []);

  const stats = calculateStats(detections);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="mx-auto">
        <Header
          onDownloadReport={handleOpenReport}
          currentView={currentView}
          onNavigate={setCurrentView}
        />

        {currentView === 'live' ? (
          <LiveMonitoring />
        ) : (
          <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-12 animate-fade-in">
            <div className="lg:col-span-12">
              <StatsSection stats={stats} detections={detections} />
            </div>

            <div className="lg:col-span-6"><IncidentsOverTimeChart detections={detections} /></div>
            <div className="lg:col-span-6"><AreaWiseIncidentsChart detections={detections} plantZones={currentPlant.zones} /></div>
            <div className="lg:col-span-4"><RiskLevelChart detections={detections} /></div>
            <div className="lg:col-span-4"><CameraUptimeChart /></div>
            <div className="lg:col-span-4"><IncidentTypeChart detections={detections} /></div>

            <div className="lg:col-span-12">
              <DetectionsTable detections={detections} onViewDetails={handleViewDetails} />
            </div>
          </div>
        )}
      </div>

      {selectedDetection && (
        <DetectionModal detection={selectedDetection} onClose={handleCloseModal} />
      )}
      {showReportModal && (
        <ReportDownloadModal
          onClose={handleCloseReport}
          detections={detections}
          currentPlant={currentPlant}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <PlantProvider>
      <AppContent />
    </PlantProvider>
  );
}
