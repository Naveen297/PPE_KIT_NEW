const RiskLevelChart = ({ detections }) => {
  const riskTypes = [
    { type: 'High risk', count: 78, color: '#ef4444' },
    { type: 'Medium risk', count: 142, color: '#f59e0b' },
    { type: 'Under control', count: 187, color: '#10b981' }
  ];

  const total = riskTypes.reduce((sum, r) => sum + r.count, 0);
  const chartSize = 140;
  const strokeWidth = 30;
  const radius = (chartSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="h-full p-5 bg-white border border-gray-200 shadow-md rounded-2xl">
      <h3 className="mb-2 text-sm font-bold text-gray-800">
        Level of Risk
      </h3>
      <p className="mb-4 text-xs text-gray-500">Pie Chart • Unit: Numbers</p>

      <div className="relative w-36 h-36 mx-auto">
        <svg viewBox={`0 0 ${chartSize} ${chartSize}`} className="transform -rotate-90">
          {riskTypes.map((item, index) => {
            const percentage = (item.count / total) * 100;
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -currentOffset;
            currentOffset += (percentage / 100) * circumference;

            return (
              <circle
                key={index}
                cx={chartSize / 2}
                cy={chartSize / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        {riskTypes.map((risk, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: risk.color }}></div>
              <span className="text-xs font-medium text-gray-700">{risk.type}</span>
            </div>
            <span className="text-xs font-semibold text-gray-800">{risk.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskLevelChart;
