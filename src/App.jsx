import { useState, useCallback } from 'react';
import { ServerCrash, RefreshCw, Power } from 'lucide-react';
import { PlantProvider } from '@/context/PlantContext';
import { useApiResource } from '@/hooks';
import { getDashboardStats, startBackend } from '@/api';

// Layout
import Header from '@/components/layout/Header/Header';

// Dashboard
import { StatsSection, DetectionsTable, PeriodTabs } from '@/components/dashboard';

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

/** Top-of-page banner shown when the backend can't be reached. */
const ConnectionBanner = ({ error, onRetry }) => {
  const [starting, setStarting] = useState(false);
  const [note, setNote] = useState(null);

  const handleStart = async () => {
    setStarting(true);
    setNote(null);
    try {
      await startBackend();
      setNote('Engine start requested — retrying…');
      onRetry();
    } catch (e) {
      setNote(e.message);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
          <ServerCrash className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-bold text-rose-800">Can’t reach the detection backend</p>
          <p className="mt-0.5 text-xs text-rose-600">
            {error?.message || 'The server is not responding.'} {note && `· ${note}`}
          </p>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <button
          onClick={handleStart}
          disabled={starting}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 shadow-xs transition-colors hover:bg-rose-100 disabled:opacity-60"
        >
          <Power className="h-3.5 w-3.5" aria-hidden="true" />
          Start engine
        </button>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-rose-700"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Retry
        </button>
      </div>
    </div>
  );
};

/** Inner app — owns view + period state and the shared dashboard-stats fetch. */
function AppContent() {
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [period, setPeriod] = useState('weekly');
  const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' });

  // Only send dates once a full custom range is chosen, so we don't refetch
  // on every half-completed selection.
  const customReady =
    period === 'custom' && customRange.startDate && customRange.endDate;
  const statsRange = customReady ? customRange : {};

  const stats = useApiResource(
    (signal) => getDashboardStats(period, statsRange, signal),
    [period, customReady ? customRange.startDate : '', customReady ? customRange.endDate : ''],
  );

  const handleViewDetails = useCallback((d) => setSelectedDetection(d), []);
  const handleCloseModal = useCallback(() => setSelectedDetection(null), []);
  const handleOpenReport = useCallback(() => setShowReportModal(true), []);
  const handleCloseReport = useCallback(() => setShowReportModal(false), []);

  const showConnectionBanner = currentView === 'dashboard' && stats.error?.isNetwork;

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
        ) : (
          <>
            {showConnectionBanner && (
              <ConnectionBanner error={stats.error} onRetry={stats.refetch} />
            )}

            <main className="mt-6 space-y-5 animate-fade-in">
              {/* Title + period control */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
                    Safety Overview
                  </h1>
                  <p className="mt-1 text-sm text-ink-500">
                    Real-time PPE compliance monitoring · AI-powered detection
                  </p>
                </div>
                <PeriodTabs
                  value={period}
                  onChange={setPeriod}
                  customRange={customRange}
                  onCustomRangeChange={setCustomRange}
                />
              </div>

              <StatsSection
                stats={stats.data}
                loading={stats.loading}
                error={stats.error}
                onRetry={stats.refetch}
              />

              <section aria-label="Analytics">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-12">
                  <div className="md:col-span-2 xl:col-span-8">
                    <IncidentsOverTimeChart />
                  </div>
                  <div className="md:col-span-1 xl:col-span-4">
                    <RiskLevelChart period={period} />
                  </div>
                  <div className="md:col-span-1 xl:col-span-4">
                    <AreaWiseIncidentsChart period={period} />
                  </div>
                  <div className="md:col-span-1 xl:col-span-4">
                    <IncidentTypeChart period={period} />
                  </div>
                  <div className="md:col-span-1 xl:col-span-4">
                    <CameraUptimeChart period={period} />
                  </div>
                </div>
              </section>

              <DetectionsTable onViewDetails={handleViewDetails} />
            </main>
          </>
        )}
      </div>

      {selectedDetection && (
        <DetectionModal detection={selectedDetection} onClose={handleCloseModal} />
      )}
      {showReportModal && <ReportDownloadModal onClose={handleCloseReport} />}
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
