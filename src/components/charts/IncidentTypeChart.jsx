import { useMemo } from 'react';

/** Derives per-item-type violation counts from real detections. */
const INCIDENT_COLORS = ['#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6'];

const ITEM_LABELS = {
  'Safety Helmet':  'PPE - No Hard Hat',
  'Safety Gloves':  'PPE - No Safety Gloves',
  'Safety Vest':    'PPE - No Safety Vest',
  'Safety Boots':   'PPE - No Safety Boots',
  'Safety Goggles': 'PPE - No Goggles',
  'Face Mask':      'PPE - No Face Mask',
};

/**
 * IncidentTypeChart — Horizontal bar chart showing counts by missing PPE type.
 *
 * @param {Object} props
 * @param {Array}   props.detections - Detection records.
 * @param {boolean} props.compact    - Uses a shorter card for dashboard summary rows.
 */
const IncidentTypeChart = ({ detections, compact = false }) => {
  const incidentTypes = useMemo(() => {
    const counts = {};
    detections
      .filter((d) => d.status === 'violation')
      .forEach((d) => {
        d.missingItems?.forEach((item) => {
          const label = ITEM_LABELS[item] ?? `PPE - No ${item}`;
          counts[label] = (counts[label] ?? 0) + 1;
        });
      });
    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, compact ? 5 : 6);
  }, [compact, detections]);

  const maxCount = Math.max(...incidentTypes.map((i) => i.count), 1);

  return (
    <div className={`h-full bg-white border border-gray-200 ${compact ? 'p-4 shadow-sm rounded-xl' : 'p-5 shadow-md rounded-2xl'}`}>
      <h3 className="mb-3 text-sm font-bold text-gray-800">Type of Incidents</h3>
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        {incidentTypes.map(({ type, count }, idx) => (
          <div key={type} className="flex items-center gap-2">
            <div className="flex-shrink-0 w-3 h-3 rounded-full" style={{ backgroundColor: INCIDENT_COLORS[idx % INCIDENT_COLORS.length] }} />
            <div className="flex items-center flex-1 gap-2">
              <div className={`${compact ? 'w-24' : 'w-40'} text-xs font-medium text-gray-700 truncate`}>{type}</div>
              <div className={`relative flex-1 ${compact ? 'h-4' : 'h-5'} overflow-hidden bg-gray-100 rounded`}>
                <div
                  className="h-full transition-all duration-500 rounded"
                  style={{ width: `${(count / maxCount) * 100}%`, backgroundColor: INCIDENT_COLORS[idx % INCIDENT_COLORS.length] }}
                />
              </div>
              <span className="w-8 text-xs font-semibold text-right text-gray-700">{count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncidentTypeChart;
