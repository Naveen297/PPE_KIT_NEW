import { useState } from 'react';

const IncidentsOverTimeChart = ({ detections }) => {
  const [viewMode, setViewMode] = useState('weekly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const generateData = () => {
    if (viewMode === 'weekly') {
      return [
        { day: 'Mon', count: 45 },
        { day: 'Tue', count: 52 },
        { day: 'Wed', count: 38 },
        { day: 'Thu', count: 61 },
        { day: 'Fri', count: 48 },
        { day: 'Sat', count: 35 },
        { day: 'Sun', count: 28 }
      ];
    } else if (viewMode === 'monthly') {
      return [
        { day: 'Week 1', count: 145 },
        { day: 'Week 2', count: 182 },
        { day: 'Week 3', count: 158 },
        { day: 'Week 4', count: 201 }
      ];
    } else if (viewMode === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      if (daysDiff <= 7) {
        return Array.from({ length: daysDiff }, (_, i) => {
          const date = new Date(start);
          date.setDate(start.getDate() + i);
          return {
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            count: Math.floor(Math.random() * 40) + 30
          };
        });
      } else if (daysDiff <= 31) {
        const weeks = Math.ceil(daysDiff / 7);
        return Array.from({ length: weeks }, (_, i) => ({
          day: `Week ${i + 1}`,
          count: Math.floor(Math.random() * 100) + 120
        }));
      } else {
        const months = Math.ceil(daysDiff / 30);
        return Array.from({ length: Math.min(months, 12) }, (_, i) => {
          const date = new Date(start);
          date.setMonth(start.getMonth() + i);
          return {
            day: date.toLocaleDateString('en-US', { month: 'short' }),
            count: Math.floor(Math.random() * 300) + 400
          };
        });
      }
    }
    return [];
  };

  const data = generateData();
  const maxValue = data.length > 0 ? Math.max(...data.map(d => d.count)) : 0;

  const getTitle = () => {
    if (viewMode === 'weekly') return 'Last 7 days';
    if (viewMode === 'monthly') return 'Last 4 weeks';
    if (viewMode === 'custom' && startDate && endDate) {
      return `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return 'Select date range';
  };

  const handleApplyCustomRange = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end >= start) {
        setShowDatePicker(false);
      } else {
        alert('End date must be after start date');
      }
    }
  };

  return (
    <div className="relative h-full p-5 bg-white border border-gray-200 shadow-md rounded-2xl">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-gray-800">
            Number of Incidents
          </h3>
          <p className="mt-1 text-xs text-gray-500">Bar Graph • {getTitle()} • Unit: Numbers</p>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => {
              setViewMode('weekly');
              setShowDatePicker(false);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => {
              setViewMode('monthly');
              setShowDatePicker(false);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => {
              setViewMode('custom');
              setShowDatePicker(!showDatePicker);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'custom'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {showDatePicker && (
        <div className="absolute right-5 top-16 z-10 p-4 bg-white border-2 border-gray-200 rounded-xl shadow-lg w-72">
          <div className="mb-3">
            <label className="block mb-1 text-xs font-semibold text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1 text-xs font-semibold text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApplyCustomRange}
              className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
            <button
              onClick={() => setShowDatePicker(false)}
              className="flex-1 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {data.length > 0 ? (
        <div className="flex items-end justify-around gap-2 mt-4" style={{ height: '200px' }}>
          {data.map((item, index) => {
            const heightPercentage = (item.count / maxValue) * 100;
            const barHeight = `${heightPercentage}%`;

            return (
              <div key={index} className="flex flex-col items-center justify-end flex-1 h-full gap-2">
                <div className="text-xs font-semibold text-gray-700">{item.count}</div>
                <div
                  className="w-full transition-all duration-500 rounded-t"
                  style={{
                    height: barHeight,
                    minHeight: '10px',
                    background: 'linear-gradient(to top, #1e40af 0%, #3b82f6 100%)'
                  }}
                />
                <div className="text-xs font-medium text-center text-gray-600">{item.day}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center" style={{ height: '200px' }}>
          <p className="text-sm text-gray-500">Please select a date range</p>
        </div>
      )}
    </div>
  );
};

export default IncidentsOverTimeChart;
