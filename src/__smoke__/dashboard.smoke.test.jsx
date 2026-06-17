/* Smoke test — mounts the API-driven dashboard pieces to guard against runtime
   crashes (bad imports, undefined access, Recharts render errors). The API layer
   is mocked so components exercise their real data path without a backend.
   ResizeObserver/matchMedia polyfills live in src/test/setup.jsx. */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

// --- Mock the API layer with deterministic fixtures -------------------------
vi.mock('@/api', () => ({
  ApiError: class ApiError extends Error {},
  getDashboardStats: vi.fn(() =>
    Promise.resolve({
      totalDetections: 150,
      compliant: 105,
      violations: 45,
      complianceRate: 70.0,
      ppeBreakdown: { helmet: 18, gloves: 0, apron: 9, mobile: 0, shoes: 0, goggles: 0 },
    }),
  ),
  getAreaWise: vi.fn(() => Promise.resolve([{ area: 'Engine Line', count: 12 }, { area: 'Bolero Dock', count: 9 }])),
  getRiskLevel: vi.fn(() =>
    Promise.resolve([
      { type: 'High Risk', count: 8, color: '#ef4444' },
      { type: 'Medium Risk', count: 14, color: '#f59e0b' },
      { type: 'Under Control', count: 32, color: '#10b981' },
    ]),
  ),
  getIncidentType: vi.fn(() => Promise.resolve([{ type: 'PPE - No Hard Hat', count: 18 }])),
  getCameraUptime: vi.fn(() =>
    Promise.resolve({
      uptimePercent: 85.7,
      downtimePercent: 14.3,
      totalHours: 720,
      uptimeHours: 617,
      downtimeHours: 103,
      totalCameras: 7,
      onlineCameras: 6,
      offlineCameras: 1,
    }),
  ),
  getIncidentsOverTime: vi.fn(() =>
    Promise.resolve({ title: 'Last 7 days', labels: ['Sat', 'Sun', 'Mon'], values: [3, 7, 5] }),
  ),
  getDetections: vi.fn(() =>
    Promise.resolve({
      data: [
        {
          id: 1,
          timestamp: new Date().toISOString(),
          location: 'Engine Line',
          status: 'violation',
          confidence: 91.2,
          ppeItems: ['apron'],
          missingItems: ['helmet'],
          imageUrl: null,
        },
      ],
      pagination: { page: 1, limit: 6, total: 1, totalPages: 1 },
    }),
  ),
  getDetection: vi.fn(() => Promise.resolve({ id: 1, status: 'violation', confidence: 91.2, ppeItems: [], missingItems: ['helmet'] })),
  detectionStreamUrl: () => 'http://localhost/stream',
  videoSocketUrl: () => 'ws://localhost/ws',
}));

import StatsSection from '@/components/dashboard/StatsSection';
import DetectionsTable from '@/components/dashboard/DetectionsTable';
import IncidentsOverTimeChart from '@/components/charts/IncidentsOverTimeChart';
import AreaWiseIncidentsChart from '@/components/charts/AreaWiseIncidentsChart';
import RiskLevelChart from '@/components/charts/RiskLevelChart';
import CameraUptimeChart from '@/components/charts/CameraUptimeChart';
import IncidentTypeChart from '@/components/charts/IncidentTypeChart';
import { computeKpiTrends } from '@/lib/kpi';

const stats = {
  totalDetections: 150,
  compliant: 105,
  violations: 45,
  complianceRate: 70.0,
  ppeBreakdown: { helmet: 18, gloves: 0, apron: 9, mobile: 0, shoes: 0, goggles: 0 },
};

describe('dashboard smoke (API-driven)', () => {
  it('computeKpiTrends still returns a well-formed shape', () => {
    const detections = Array.from({ length: 10 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 36e5).toISOString(),
      status: i % 2 ? 'violation' : 'compliant',
    }));
    const t = computeKpiTrends(detections);
    expect(t.total.series).toHaveLength(14);
    expect(Number.isNaN(t.violations.deltaPct)).toBe(false);
  });

  it('StatsSection renders KPI + breakdown from stats payload', () => {
    render(<StatsSection stats={stats} loading={false} error={null} />);
    expect(screen.getByText('Total Detections')).toBeTruthy();
    expect(screen.getByText('PPE Violations by Item')).toBeTruthy();
    cleanup();
  });

  it('StatsSection shows a skeleton while loading', () => {
    const { container } = render(<StatsSection stats={null} loading error={null} />);
    expect(container.querySelector('.skeleton')).toBeTruthy();
    cleanup();
  });

  it('mounts DetectionsTable without crashing', async () => {
    render(<DetectionsTable onViewDetails={() => {}} />);
    expect(await screen.findByText('PPE Detection Log')).toBeTruthy();
    cleanup();
  });

  it('mounts every chart without crashing', async () => {
    render(
      <div>
        <IncidentsOverTimeChart />
        <AreaWiseIncidentsChart period="weekly" />
        <RiskLevelChart period="weekly" />
        <CameraUptimeChart period="weekly" />
        <IncidentTypeChart period="weekly" />
      </div>,
    );
    expect(await screen.findByText('Violations by Zone')).toBeTruthy();
    expect(screen.getByText('Risk Distribution')).toBeTruthy();
    expect(screen.getByText('Camera Uptime')).toBeTruthy();
    expect(screen.getByText('Incident Types')).toBeTruthy();
    expect(screen.getByText('Incidents Over Time')).toBeTruthy();
    cleanup();
  });
});
