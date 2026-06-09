/** CameraUptimeChart — Static pie chart showing system camera uptime. */
const CHART_SIZE   = 140;
const STROKE_WIDTH = 30;
const RADIUS       = (CHART_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const UPTIME_DATA = { uptime: 95.8, downtime: 4.2, totalHours: 720, uptimeHours: 690 };

const CameraUptimeChart = ({ compact = false }) => {
  const { uptime, downtime, totalHours, uptimeHours } = UPTIME_DATA;
  const uptimeDash = (uptime / 100) * CIRCUMFERENCE;

  return (
    <div className={`h-full bg-white border border-gray-200 ${compact ? 'p-4 shadow-sm rounded-xl' : 'p-5 shadow-md rounded-2xl'}`}>
      <h3 className="mb-3 text-sm font-bold text-gray-800">Uptime of Cameras</h3>

      <div className={`relative ${compact ? 'w-24 h-24' : 'w-36 h-36'} mx-auto`}>
        <svg viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} className="transform -rotate-90">
          <circle cx={CHART_SIZE / 2} cy={CHART_SIZE / 2} r={RADIUS} fill="none"
            stroke="#1e40af" strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${uptimeDash} ${CIRCUMFERENCE}`}
            className="transition-all duration-500" />
          <circle cx={CHART_SIZE / 2} cy={CHART_SIZE / 2} r={RADIUS} fill="none"
            stroke="#ef4444" strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${((downtime / 100) * CIRCUMFERENCE)} ${CIRCUMFERENCE}`}
            strokeDashoffset={`-${uptimeDash}`}
            className="transition-all duration-500" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-gray-800`}>{uptime}%</div>
        </div>
      </div>

      <div className={`flex flex-col ${compact ? 'gap-1.5 mt-3' : 'gap-2 mt-4'}`}>
        {[
          { label: 'Uptime',   value: `${uptime}% (${uptimeHours}h)`,               color: 'bg-blue-800' },
          { label: 'Downtime', value: `${downtime}% (${totalHours - uptimeHours}h)`, color: 'bg-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 ${color} rounded`} />
              <span className="text-xs font-medium text-gray-700">{label}</span>
            </div>
            <span className="text-xs font-semibold text-gray-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CameraUptimeChart;
