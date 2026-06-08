import { useMemo } from 'react';

/**
 * AreaWiseIncidentsChart — Horizontal bar chart showing violations per zone.
 * Derived from real detections data grouped by location.
 *
 * @param {Object} props
 * @param {Array}  props.detections  - Detection records.
 * @param {Array}  props.plantZones  - Zone names for the current plant.
 */
const AreaWiseIncidentsChart = ({ detections, plantZones = [] }) => {
  const data = useMemo(() => {
    const counts = {};
    plantZones.forEach((z) => { counts[z] = 0; });
    detections
      .filter((d) => d.status === 'violation')
      .forEach((d) => {
        if (d.location in counts) counts[d.location]++;
        else counts[d.location] = (counts[d.location] ?? 0) + 1;
      });
    return Object.entries(counts)
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [detections, plantZones]);

  const maxValue = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="h-full p-5 bg-white border border-gray-200 shadow-md rounded-2xl">
      <h3 className="mb-2 text-sm font-bold text-gray-800">Area-wise Incidents</h3>
      <p className="mb-4 text-xs text-gray-500">Horizontal Bar • Last 30 days • Unit: Numbers</p>
      <div className="space-y-3">
        {data.map(({ area, count }) => (
          <div key={area} className="flex items-center gap-3">
            <div className="w-32 text-xs font-medium text-gray-700 truncate">{area}</div>
            <div className="relative flex-1 h-7 overflow-hidden bg-gray-100 rounded">
              <div
                className="h-full transition-all duration-500 rounded"
                style={{ width: `${(count / maxValue) * 100}%`, background: 'linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)' }}
              />
              <span className="absolute text-xs font-semibold text-gray-700 transform -translate-y-1/2 right-2 top-1/2">
                {count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AreaWiseIncidentsChart;
