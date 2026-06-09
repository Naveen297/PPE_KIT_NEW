import { useState, useCallback } from 'react';
import { PlantProvider, usePlant } from '@/context/PlantContext';
import { calculateStats } from '@/utils';

// Layout
import Header from '@/components/layout/Header/Header';

// Dashboard
import {
  StatsSection,
  DetectionsTable,
  DashboardSkeleton,
} from '@/components/dashboard';

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

/** Inner app — consumes PlantContext. */
function AppContent() {
  const { detections, isLoading, currentPlant } = usePlant();

  const [selectedDetection, setSelectedDetection] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  const handleViewDetails = useCallback((d) => setSelectedDetection(d), []);
  const handleCloseModal = useCallback(() => setSelectedDetection(null), []);
  const handleOpenReport = useCallback(() => setShowReportModal(true), []);
  const handleCloseReport = useCallback(() => setShowReportModal(false), []);

  const stats = calculateStats(detections);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 sm:py-6">
        <Header
          onDownloadReport={handleOpenReport}
          currentView={currentView}
          onNavigate={setCurrentView}
        />

        {currentView === 'live' ? (
          <div className="mt-6">
            <LiveMonitoring />
          </div>
        ) : isLoading ? (
          <div className="mt-6">
            <DashboardSkeleton />
          </div>
        ) : (
          <main className="mt-6 space-y-5 animate-fade-in">
            <StatsSection stats={stats} detections={detections} />

            <section aria-label="Analytics">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-12">
                <div className="md:col-span-2 xl:col-span-8">
                  <IncidentsOverTimeChart detections={detections} />
                </div>
                <div className="md:col-span-1 xl:col-span-4">
                  <RiskLevelChart detections={detections} />
                </div>
                <div className="md:col-span-1 xl:col-span-4">
                  <AreaWiseIncidentsChart detections={detections} plantZones={currentPlant.zones} />
                </div>
                <div className="md:col-span-1 xl:col-span-4">
                  <IncidentTypeChart detections={detections} />
                </div>
                <div className="md:col-span-1 xl:col-span-4">
                  <CameraUptimeChart />
                </div>
              </div>
            </section>

            <DetectionsTable detections={detections} onViewDetails={handleViewDetails} />
          </main>
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
