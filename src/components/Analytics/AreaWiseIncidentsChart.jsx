const AreaWiseIncidentsChart = ({ detections, plantZones }) => {
  const data = [
    { area: 'Assembly Line 1', count: 87 },
    { area: 'Welding Station', count: 72 },
    { area: 'Paint Shop', count: 65 },
    { area: 'Quality Check', count: 54 },
    { area: 'Warehouse A', count: 48 },
    { area: 'Loading Dock', count: 41 }
  ];

  const maxValue = Math.max(...data.map(d => d.count));

  return (
    <div className="h-full p-5 bg-white border border-gray-200 shadow-md rounded-2xl">
      <h3 className="mb-2 text-sm font-bold text-gray-800">
        Area-wise Incidents
      </h3>
      <p className="mb-4 text-xs text-gray-500">Bar Graph • Last 30 days • Unit: Numbers</p>

      <div className="space-y-3">
        {data.map((item, index) => {
          const width = (item.count / maxValue) * 100;
          return (
            <div key={index} className="flex items-center gap-3">
              <div className="w-32 text-xs font-medium text-gray-700 truncate">{item.area}</div>
              <div className="relative flex-1 h-7 overflow-hidden bg-gray-100 rounded">
                <div
                  className="h-full transition-all duration-500 rounded"
                  style={{
                    width: `${width}%`,
                    background: 'linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)'
                  }}
                />
                <span className="absolute text-xs font-semibold text-gray-700 transform -translate-y-1/2 right-2 top-1/2">
                  {item.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AreaWiseIncidentsChart;
