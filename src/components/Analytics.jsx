
import { useState } from 'react';
import { usePlant } from '../context/PlantContext';
import { TIME_PERIODS, PPE_ITEMS, DETECTION_STATUS } from '../constants';
import { filterByTimePeriod, calculateStats, generateReportText, getTimePeriodLabel } from '../utils/dataGenerator';

const Analytics = ({ detections }) => {
  const { currentPlant } = usePlant();
  const [timeFilter, setTimeFilter] = useState(TIME_PERIODS.MONTHLY);

  const filteredDetections = filterByTimePeriod(detections, timeFilter);
  const stats = calculateStats(filteredDetections);

  // Calculate additional analytics data
  const analyticsData = {
    // Camera Uptime - Pie chart (% and Time)
    cameraUptime: {
      uptime: 95.8,
      downtime: 4.2,
      totalHours: 720, // 30 days
      uptimeHours: 690
    },

    // Number of Incidents by time - Bar graph (Numbers)
    incidentsByTime: [
      { day: 'Mon', count: 45 },
      { day: 'Tue', count: 52 },
      { day: 'Wed', count: 38 },
      { day: 'Thu', count: 61 },
      { day: 'Fri', count: 48 },
      { day: 'Sat', count: 35 },
      { day: 'Sun', count: 28 }
    ],

    // Area-wise incidents - Bar graph (Numbers)
    areaWiseIncidents: [
      { area: 'Assembly Line 1', count: 87 },
      { area: 'Welding Station', count: 72 },
      { area: 'Paint Shop', count: 65 },
      { area: 'Quality Check', count: 54 },
      { area: 'Warehouse A', count: 48 },
      { area: 'Loading Dock', count: 41 }
    ],

    // Type of Risk
    riskTypes: [
      { type: 'High risk', count: 78, color: '#ef4444' },
      { type: 'Medium risk', count: 142, color: '#f59e0b' },
      { type: 'Under control', count: 187, color: '#10b981' }
    ],

    // Type of Incidents
    incidentTypes: [
      { type: 'PPE - No Hard Hat', count: 95 },
      { type: 'PPE - No Safety Vest', count: 78 },
      { type: 'Unauthorized Zone Access', count: 62 },
      { type: 'Forklift Near Miss', count: 45 },
      { type: 'Aisle Obstruction', count: 38 },
      { type: 'Walkway Obstruction', count: 32 }
    ],

    // BBS Score (Behavior Based Safety) - Safe Acts vs Unsafe Acts
    bbsScore: {
      sa: 78,  // Safe Acts (78%)
      ua: 22   // Unsafe Acts (22%)
    }
  };

  // Generate and download report
  const handleGenerateReport = () => {
    const reportText = generateReportText(filteredDetections, currentPlant.name, timeFilter);
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Safety_Report_${currentPlant.code}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Pie Chart Component (Generic)
  const PieChart = ({ data, total, colors, showPercentage = true, size = 'small' }) => {
    const chartSize = size === 'small' ? 140 : 200;
    const strokeWidth = size === 'small' ? 30 : 40;
    const radius = (chartSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    let currentOffset = 0;
    
    return (
      <div className={`relative mx-auto ${size === 'small' ? 'w-36 h-36' : 'w-52 h-52'}`}>
        <svg viewBox={`0 0 ${chartSize} ${chartSize}`} className="transform -rotate-90">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
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
                stroke={colors[index]}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`font-bold text-gray-800 ${size === 'small' ? 'text-2xl' : 'text-3xl'}`}>
                {((data[0].value / total) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Bar Chart Component
  const BarChart = ({ data, color = '#3b82f6', horizontal = false, showValues = true }) => {
    const maxValue = Math.max(...data.map(d => d.count));
    
    if (horizontal) {
      return (
        <div className="space-y-2">
          {data.map((item, index) => {
            const width = (item.count / maxValue) * 100;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-32 text-xs font-medium text-gray-700 truncate">{item.area || item.type}</div>
                <div className="relative flex-1 h-6 overflow-hidden bg-gray-100 rounded">
                  <div 
                    className="h-full transition-all duration-500 rounded"
                    style={{ 
                      width: `${width}%`,
                      background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`
                    }}
                  />
                  {showValues && (
                    <span className="absolute text-xs font-semibold text-gray-700 transform -translate-y-1/2 right-2 top-1/2">
                      {item.count}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="flex items-end justify-around h-40 gap-4">
        {data.map((item, index) => {
          const height = (item.count / maxValue) * 100;
          return (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="text-xs font-semibold text-gray-700">{item.count}</div>
              <div 
                className="w-10 transition-all duration-500 rounded-t"
                style={{ 
                  height: `${height}%`,
                  background: `linear-gradient(to top, ${color} 0%, ${color}dd 100%)`
                }}
              />
              <div className="text-xs font-medium text-gray-600">{item.day}</div>
            </div>
          );
        })}
      </div>
    );
  };

  // BBS Score Gauge Component
  const BBSScoreGauge = ({ sa, ua }) => {
    const total = sa + ua;
    const saPercentage = (sa / total) * 100;
    const uaPercentage = (ua / total) * 100;
    
    return (
      <div className="relative w-40 h-40 mx-auto">
        <svg viewBox="0 0 160 160" className="transform -rotate-90">
          {/* UA (Unsafe Acts) - larger portion */}
          <circle
            cx="80"
            cy="80"
            r="60"
            fill="none"
            stroke="#1e3a5f"
            strokeWidth="35"
            strokeDasharray={`${uaPercentage * 3.77} 377`}
            className="transition-all duration-500"
          />
          {/* SA (Safe Acts) - smaller portion */}
          <circle
            cx="80"
            cy="80"
            r="60"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="35"
            strokeDasharray={`${saPercentage * 3.77} 377`}
            strokeDashoffset={`-${uaPercentage * 3.77}`}
            className="transition-all duration-500"
          />
          {/* Pointer/Needle */}
          <line
            x1="80"
            y1="80"
            x2="80"
            y2="30"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-500"
            style={{
              transform: `rotate(${(uaPercentage / 100) * 180}deg)`,
              transformOrigin: '80px 80px'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">{ua}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-5 bg-white border border-gray-200 shadow-md rounded-2xl">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 mb-5 lg:flex-row lg:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics Overview
          </h2>
          <p className="text-gray-600 text-xs mt-0.5">
            {currentPlant.name} - Last {timeFilter === 'daily' ? '24 hours' : timeFilter === 'weekly' ? '7 days' : '30 days'}
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex gap-2">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            {[
              { id: TIME_PERIODS.DAILY, label: 'Today' },
              { id: TIME_PERIODS.WEEKLY, label: 'Last 7 days' },
              { id: TIME_PERIODS.MONTHLY, label: 'Last 30 days' }
            ].map(period => (
              <button
                key={period.id}
                onClick={() => setTimeFilter(period.id)}
                className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all duration-200 ${
                  timeFilter === period.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleGenerateReport}
            disabled={stats.total === 0}
            className={`px-4 py-1.5 rounded-lg font-medium text-xs text-white shadow-sm transition-all duration-200 flex items-center gap-2 ${
              stats.total > 0
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-md'
                : 'bg-gray-400 cursor-not-allowed opacity-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Report
          </button>
        </div>
      </div>

      {/* Main Analytics Grid - 3 columns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        
        {/* Column 1: Number of Incidents & Area-wise */}
        <div className="space-y-4">
          {/* Number of Incidents (Bar Chart - Weekly) */}
          <div
            className="p-4 transition-shadow bg-white border border-gray-200 shadow-sm cursor-pointer rounded-xl hover:shadow-md"
            onClick={handleGenerateReport}
          >
            <h3 className="mb-3 text-sm font-bold text-gray-800">Number of Incidents</h3>
            <p className="mb-3 text-xs text-gray-500">Bar Graph • Last 7 days • Unit: Numbers</p>
            <BarChart
              data={analyticsData.incidentsByTime}
              color="#1e40af"
              showValues={true}
            />
          </div>

          {/* Area-wise Incidents (Horizontal Bar Chart) */}
          <div
            className="p-4 transition-shadow bg-white border border-gray-200 shadow-sm cursor-pointer rounded-xl hover:shadow-md"
            onClick={handleGenerateReport}
          >
            <h3 className="mb-3 text-sm font-bold text-gray-800">Area-wise Incidents</h3>
            <p className="mb-3 text-xs text-gray-500">Bar Graph • Last 30 days • Unit: Numbers</p>
            <BarChart
              data={analyticsData.areaWiseIncidents}
              color="#1e40af"
              horizontal={true}
            />
          </div>
        </div>

        {/* Column 2: BBS Score & Type of Risk */}
        <div className="space-y-4">
          {/* BBS Score (Pie Chart/Gauge) */}
          <div
            className="p-4 transition-shadow shadow-sm cursor-pointer bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl hover:shadow-md"
            onClick={handleGenerateReport}
          >
            <h3 className="mb-2 text-sm font-bold text-white">BBS Score</h3>
            <p className="mb-3 text-xs text-gray-300">Gauge Chart • Behavior Based Safety • Unit: %</p>
            <BBSScoreGauge
              sa={analyticsData.bbsScore.sa}
              ua={analyticsData.bbsScore.ua}
            />
            <div className="flex justify-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue-900 rounded-full"></div>
                <span className="text-xs font-medium text-white">UA: {analyticsData.bbsScore.ua}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-xs font-medium text-white">SA: {analyticsData.bbsScore.sa}%</span>
              </div>
            </div>
          </div>

          {/* Type of Risk (Pie Chart) */}
          <div 
            className="p-4 transition-shadow bg-white border border-gray-200 shadow-sm cursor-pointer rounded-xl hover:shadow-md"
            onClick={handleGenerateReport}
          >
            <h3 className="mb-3 text-sm font-bold text-gray-800">Level of Risk</h3>
            <PieChart 
              data={analyticsData.riskTypes.map(r => ({ value: r.count }))}
              total={analyticsData.riskTypes.reduce((sum, r) => sum + r.count, 0)}
              colors={analyticsData.riskTypes.map(r => r.color)}
              showPercentage={false}
              size="small"
            />
            <div className="flex flex-col gap-1.5 mt-3">
              {analyticsData.riskTypes.map((risk, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: risk.color }}></div>
                    <span className="text-xs font-medium text-gray-700">{risk.type}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-800">{risk.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Camera Uptime & Type of Incidents */}
        <div className="space-y-4">
          {/* Camera Uptime (Pie Chart) */}
          <div
            className="p-4 transition-shadow bg-white border border-gray-200 shadow-sm cursor-pointer rounded-xl hover:shadow-md"
            onClick={handleGenerateReport}
          >
            <h3 className="mb-3 text-sm font-bold text-gray-800">Uptime of Cameras</h3>
            <p className="mb-3 text-xs text-gray-500">Pie Chart • Last 30 days • Unit: % and Time</p>
            <PieChart
              data={[
                { value: analyticsData.cameraUptime.uptime },
                { value: analyticsData.cameraUptime.downtime }
              ]}
              total={100}
              colors={['#1e40af', '#ef4444']}
              showPercentage={true}
              size="small"
            />
            <div className="flex flex-col gap-1.5 mt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-blue-800 rounded"></div>
                  <span className="text-xs font-medium text-gray-700">Uptime</span>
                </div>
                <span className="text-xs font-semibold text-gray-800">{analyticsData.cameraUptime.uptime}% ({analyticsData.cameraUptime.uptimeHours}h)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-xs font-medium text-gray-700">Downtime</span>
                </div>
                <span className="text-xs font-semibold text-gray-800">
                  {analyticsData.cameraUptime.downtime}% ({analyticsData.cameraUptime.totalHours - analyticsData.cameraUptime.uptimeHours}h)
                </span>
              </div>
            </div>
          </div>

          {/* Type of Incidents (Horizontal Bar Chart) */}
          <div 
            className="p-4 transition-shadow bg-white border border-gray-200 shadow-sm cursor-pointer rounded-xl hover:shadow-md"
            onClick={handleGenerateReport}
          >
            <h3 className="mb-3 text-sm font-bold text-gray-800">Type of Incidents</h3>
            <p className="mb-3 text-xs text-gray-500">Score of safety - Last 30 days</p>
            <div className="space-y-2">
              {analyticsData.incidentTypes.map((incident, idx) => {
                const maxCount = Math.max(...analyticsData.incidentTypes.map(i => i.count));
                const width = (incident.count / maxCount) * 100;
                const colors = ['#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6'];
                
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <div 
                      className="flex-shrink-0 w-3 h-3 rounded-full" 
                      style={{ backgroundColor: colors[idx % colors.length] }}
                    />
                    <div className="flex items-center flex-1 gap-2">
                      <div className="w-40 text-xs font-medium text-gray-700 truncate">{incident.type}</div>
                      <div className="relative flex-1 h-4 overflow-hidden bg-gray-100 rounded">
                        <div 
                          className="h-full transition-all duration-500 rounded"
                          style={{ 
                            width: `${width}%`,
                            backgroundColor: colors[idx % colors.length]
                          }}
                        />
                      </div>
                      <span className="w-8 text-xs font-semibold text-right text-gray-700">{incident.count.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;