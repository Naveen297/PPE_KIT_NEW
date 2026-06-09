import { useState, useMemo } from 'react';

const VIEW_MODES = [
  { id: 'weekly',  label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'custom',  label: 'Custom' },
];

/**
 * Groups detections by day-of-week, current-month weeks, or a custom range.
 */
const buildChartData = (detections, viewMode, startDate, endDate) => {
  if (viewMode === 'weekly') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = Array(7).fill(0);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    detections
      .filter((d) => new Date(d.timestamp) >= oneWeekAgo)
      .forEach((d) => { counts[new Date(d.timestamp).getDay()]++; });
    return days.map((day, i) => ({ day, count: counts[i] }));
  }

  if (viewMode === 'monthly') {
    const weeks = [0, 0, 0, 0];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    detections
      .filter((d) => {
        const detectionDate = new Date(d.timestamp);
        return detectionDate >= monthStart && detectionDate <= monthEnd;
      })
      .forEach((d) => {
        const dayOfMonth = new Date(d.timestamp).getDate();
        const weekIdx = Math.min(3, Math.floor((dayOfMonth - 1) / 7));
        weeks[weekIdx]++;
      });
    return weeks.map((count, i) => ({ day: `Week ${i + 1}`, count }));
  }

  if (viewMode === 'custom' && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end - start) / (24 * 60 * 60 * 1000)) + 1;
    const filtered = detections.filter((d) => {
      const t = new Date(d.timestamp);
      return t >= start && t <= end;
    });

    if (daysDiff <= 7) {
      return Array.from({ length: daysDiff }, (_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
        const count = filtered.filter((d) => new Date(d.timestamp).toDateString() === date.toDateString()).length;
        return { day: dayLabel, count };
      });
    }

    const weeks = Math.ceil(daysDiff / 7);
    return Array.from({ length: weeks }, (_, i) => ({
      day: `Week ${i + 1}`,
      count: filtered.filter((d) => {
        const daysFromStart = Math.floor((new Date(d.timestamp) - start) / (24 * 60 * 60 * 1000));
        return daysFromStart >= i * 7 && daysFromStart < (i + 1) * 7;
      }).length,
    }));
  }

  return [];
};

/**
 * IncidentsOverTimeChart — Bar chart of detection counts over a time window.
 * Derived from real `detections` data.
 *
 * @param {Object} props
 * @param {Array}   props.detections - Detection records from context.
 * @param {boolean} props.compact    - Uses a shorter card for dashboard summary rows.
 */
const IncidentsOverTimeChart = ({ detections, compact = false }) => {
  const [viewMode, setViewMode]         = useState('weekly');
  const [startDate, setStartDate]       = useState('');
  const [endDate, setEndDate]           = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateError, setDateError]       = useState(null);

  const data = useMemo(
    () => buildChartData(detections, viewMode, startDate, endDate),
    [detections, viewMode, startDate, endDate],
  );

  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.count), 1) : 1;

  const getTitle = () => {
    if (viewMode === 'weekly') return 'Last 7 days';
    if (viewMode === 'monthly') {
      return new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    if (viewMode === 'custom' && startDate && endDate) {
      return `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return 'Select date range';
  };

  const handleApplyCustomRange = () => {
    if (!startDate || !endDate) { setDateError('Both dates are required.'); return; }
    if (new Date(endDate) < new Date(startDate)) { setDateError('End date must be after start date.'); return; }
    setDateError(null);
    setShowDatePicker(false);
  };

  const chartHeight = compact ? '128px' : '200px';

  return (
    <div className={`relative h-full bg-white border border-gray-200 ${compact ? 'p-4 shadow-sm rounded-xl' : 'p-5 shadow-md rounded-2xl'}`}>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-sm font-bold text-gray-800">Number of Incidents</h3>
          <span className="max-w-[55%] truncate px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-md">
            {getTitle()}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1">
          {VIEW_MODES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => { setViewMode(id); setShowDatePicker(id === 'custom' ? !showDatePicker : false); }}
              className={`min-w-0 px-2 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewMode === id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {showDatePicker && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          {[['Start Date', startDate, setStartDate], ['End Date', endDate, setEndDate]].map(([label, val, setter]) => (
            <div key={label} className="mb-2">
              <label className="block mb-1 text-xs font-semibold text-gray-700">{label}</label>
              <input
                type="date"
                value={val}
                onChange={(e) => { setter(e.target.value); setDateError(null); }}
                className="w-full min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          ))}
          {dateError && <p className="mb-2 text-xs text-red-600 font-medium">{dateError}</p>}
          <div className="flex gap-2">
            <button onClick={handleApplyCustomRange} className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Apply</button>
            <button onClick={() => setShowDatePicker(false)} className="flex-1 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      )}

      {data.length > 0 ? (
        <div className="flex items-end justify-around gap-2 mt-3" style={{ height: chartHeight }}>
          {data.map((item) => {
            const heightPct = (item.count / maxValue) * 100;
            return (
              <div key={item.day} className="flex flex-col items-center justify-end flex-1 h-full gap-2">
                <div className="text-xs font-semibold text-gray-700">{item.count}</div>
                <div
                  className="w-full transition-all duration-500 rounded-t"
                  style={{ height: `${heightPct}%`, minHeight: '4px', background: 'linear-gradient(to top, #1e40af 0%, #3b82f6 100%)' }}
                />
                <div className="text-xs font-medium text-center text-gray-600">{item.day}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center" style={{ height: chartHeight }}>
          <p className="text-sm text-gray-500">
            {viewMode === 'custom' ? 'Please select a date range' : 'No data available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default IncidentsOverTimeChart;
