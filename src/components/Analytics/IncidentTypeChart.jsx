const IncidentTypeChart = ({ detections }) => {
  const incidentTypes = [
    { type: 'PPE - No Hard Hat', count: 95 },
    { type: 'PPE - No Safety Vest', count: 78 },
    { type: 'Unauthorized Zone Access', count: 62 },
    { type: 'Forklift Near Miss', count: 45 },
    { type: 'Aisle Obstruction', count: 38 },
    { type: 'Walkway Obstruction', count: 32 }
  ];

  const maxCount = Math.max(...incidentTypes.map(i => i.count));
  const colors = ['#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6'];

  return (
    <div className="h-full p-5 bg-white border border-gray-200 shadow-md rounded-2xl">
      <h3 className="mb-2 text-sm font-bold text-gray-800">
        Type of Incidents
      </h3>
      <p className="mb-4 text-xs text-gray-500">Bar Graph • Last 30 days • Unit: Numbers</p>

      <div className="space-y-3">
        {incidentTypes.map((incident, idx) => {
          const width = (incident.count / maxCount) * 100;

          return (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="flex-shrink-0 w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[idx % colors.length] }}
              />
              <div className="flex items-center flex-1 gap-2">
                <div className="w-40 text-xs font-medium text-gray-700 truncate">{incident.type}</div>
                <div className="relative flex-1 h-5 overflow-hidden bg-gray-100 rounded">
                  <div
                    className="h-full transition-all duration-500 rounded"
                    style={{
                      width: `${width}%`,
                      backgroundColor: colors[idx % colors.length]
                    }}
                  />
                </div>
                <span className="w-8 text-xs font-semibold text-right text-gray-700">{incident.count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IncidentTypeChart;
