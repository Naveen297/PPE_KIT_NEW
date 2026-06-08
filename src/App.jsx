import { useState } from 'react';
import { PlantProvider, usePlant } from './context/PlantContext';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import DetectionsTable from './components/DetectionsTable';
import DetectionModal from './components/DetectionModal';
import ReportDownloadModal from './components/ReportDownloadModal';
import LiveMonitoring from './components/LiveMonitoring';
import { calculateStats } from './utils/dataGenerator';
import './App.css';

import IncidentsOverTimeChart from './components/Analytics/IncidentsOverTimeChart';
import AreaWiseIncidentsChart from './components/Analytics/AreaWiseIncidentsChart';
import BBScoreChart from './components/Analytics/BBScoreChart';
import RiskLevelChart from './components/Analytics/RiskLevelChart';
import CameraUptimeChart from './components/Analytics/CameraUptimeChart';
import IncidentTypeChart from './components/Analytics/IncidentTypeChart';

function AppContent() {
  const { detections, isLoading, currentPlant } = usePlant();
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  const stats = calculateStats(detections);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block w-16 h-16 mb-4 border-t-4 border-b-4 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-xl font-semibold text-gray-700">Loading Safety Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="mx-auto">
        <Header
          onDownloadReport={() => setShowReportModal(true)}
          currentView={currentView}
          onNavigate={setCurrentView}
        />

        {currentView === 'live' ? (
          <LiveMonitoring />
        ) : (
          <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-12 animate-fade-in">
            <div className="lg:col-span-12">
              <StatsCards stats={stats} detections={detections} />
            </div>

            <div className="lg:col-span-5"><IncidentsOverTimeChart detections={detections} /></div>
            <div className="lg:col-span-4"><AreaWiseIncidentsChart detections={detections} plantZones={currentPlant.zones} /></div>
            <div className="lg:col-span-3"><BBScoreChart detections={detections} /></div>
            <div className="lg:col-span-3"><RiskLevelChart detections={detections} /></div>
            <div className="lg:col-span-3"><CameraUptimeChart /></div>
            <div className="lg:col-span-6"><IncidentTypeChart detections={detections} /></div>
            <div className="lg:col-span-12">
              <DetectionsTable detections={detections} onViewDetails={setSelectedDetection} />
            </div>
          </div>
        )}
      </div>

      {selectedDetection && <DetectionModal detection={selectedDetection} onClose={() => setSelectedDetection(null)} />}
      {showReportModal && <ReportDownloadModal onClose={() => setShowReportModal(false)} detections={detections} currentPlant={currentPlant} />}
    </div>
  );
}

function App() {
  return (
    <PlantProvider>
      <AppContent />
    </PlantProvider>
  );
}

export default App;
