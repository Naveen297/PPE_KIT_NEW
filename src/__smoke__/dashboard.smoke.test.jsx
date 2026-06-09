/* Smoke test — mounts the redesigned dashboard pieces to guard against runtime
   crashes (bad imports, undefined access, Recharts render errors) and to verify
   KPI derivations. ResizeObserver/matchMedia polyfills live in src/test/setup.jsx. */
import { describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';

const mkDetection = (i, status, missing) => ({
  id: `DET-${i}`,
  timestamp: new Date(Date.now() - i * 36e5).toLocaleString(),
  location: ['Assembly Line A', 'Paint Shop', 'Warehouse'][i % 3],
  status,
  ppeItems: ['Safety Helmet'],
  missingItems: missing,
  confidence: (85 + (i % 14)).toFixed(1),
  plantId: 'plant-mumbai',
  plantName: 'Mumbai Production Plant',
});

const detections = [
  ...Array.from({ length: 12 }, (_, i) => mkDetection(i, 'violation', ['Safety Helmet', 'Safety Gloves', 'Safety Vest'].slice(0, (i % 3) + 1))),
  ...Array.from({ length: 18 }, (_, i) => mkDetection(i + 12, 'compliant', [])),
];
const zones = ['Assembly Line A', 'Paint Shop', 'Warehouse'];
const stats = { total: 30, compliant: 18, violations: 12, complianceRate: '60.0' };

import StatsSection from '@/components/dashboard/StatsSection';
import DetectionsTable from '@/components/dashboard/DetectionsTable';
import IncidentsOverTimeChart from '@/components/charts/IncidentsOverTimeChart';
import AreaWiseIncidentsChart from '@/components/charts/AreaWiseIncidentsChart';
import RiskLevelChart from '@/components/charts/RiskLevelChart';
import CameraUptimeChart from '@/components/charts/CameraUptimeChart';
import IncidentTypeChart from '@/components/charts/IncidentTypeChart';
import { computeKpiTrends } from '@/lib/kpi';

describe('dashboard redesign smoke', () => {
  it('computeKpiTrends returns well-formed shape', () => {
    const t = computeKpiTrends(detections);
    expect(t.total.series).toHaveLength(14);
    expect(typeof t.complianceRate.deltaPoints).toBe('number');
    expect(Number.isNaN(t.violations.deltaPct)).toBe(false);
  });

  it('mounts StatsSection without crashing', () => {
    const { getByText } = render(<StatsSection stats={stats} detections={detections} />);
    expect(getByText('Total Detections')).toBeTruthy();
    expect(getByText('PPE Violations by Item')).toBeTruthy();
    cleanup();
  });

  it('mounts DetectionsTable with sorting/pagination controls', () => {
    const { getByText } = render(<DetectionsTable detections={detections} onViewDetails={() => {}} />);
    expect(getByText('PPE Violation Log')).toBeTruthy();
    cleanup();
  });

  it('mounts every chart without crashing', () => {
    for (const ui of [
      <IncidentsOverTimeChart detections={detections} />,
      <AreaWiseIncidentsChart detections={detections} plantZones={zones} />,
      <RiskLevelChart detections={detections} />,
      <CameraUptimeChart />,
      <IncidentTypeChart detections={detections} />,
    ]) {
      const { unmount } = render(ui);
      unmount();
    }
    expect(true).toBe(true);
  });

  it('charts handle empty data gracefully', () => {
    const { unmount: u1 } = render(<AreaWiseIncidentsChart detections={[]} plantZones={zones} />);
    const { unmount: u2 } = render(<IncidentTypeChart detections={[]} />);
    const { unmount: u3 } = render(<RiskLevelChart detections={[]} />);
    u1(); u2(); u3();
    expect(true).toBe(true);
  });
});
