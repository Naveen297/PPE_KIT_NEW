const CameraUptimeChart = () => {
  const uptime = 95.8;
  const downtime = 4.2;
  const totalHours = 720;
  const uptimeHours = 690;

  const chartSize = 140;
  const strokeWidth = 30;
  const radius = (chartSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const uptimePercentage = uptime;
  const downtimePercentage = downtime;

  return (
    <div className="h-full p-5 bg-white border border-gray-200 shadow-md rounded-2xl">
      <h3 className="mb-2 text-sm font-bold text-gray-800">
        Uptime of Cameras
      </h3>
      <p className="mb-4 text-xs text-gray-500">Pie Chart • Last 30 days • Unit: % and Time</p>

      <div className="relative w-36 h-36 mx-auto">
        <svg viewBox={`0 0 ${chartSize} ${chartSize}`} className="transform -rotate-90">
          <circle
            cx={chartSize / 2}
            cy={chartSize / 2}
            r={radius}
            fill="none"
            stroke="#1e40af"
            strokeWidth={strokeWidth}
            strokeDasharray={`${(uptimePercentage / 100) * circumference} ${circumference}`}
            className="transition-all duration-500"
          />
          <circle
            cx={chartSize / 2}
            cy={chartSize / 2}
            r={radius}
            fill="none"
            stroke="#ef4444"
            strokeWidth={strokeWidth}
            strokeDasharray={`${(downtimePercentage / 100) * circumference} ${circumference}`}
            strokeDashoffset={`-${(uptimePercentage / 100) * circumference}`}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{uptime}%</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-800 rounded"></div>
            <span className="text-xs font-medium text-gray-700">Uptime</span>
          </div>
          <span className="text-xs font-semibold text-gray-800">{uptime}% ({uptimeHours}h)</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-xs font-medium text-gray-700">Downtime</span>
          </div>
          <span className="text-xs font-semibold text-gray-800">
            {downtime}% ({totalHours - uptimeHours}h)
          </span>
        </div>
      </div>
    </div>
  );
};

export default CameraUptimeChart;
