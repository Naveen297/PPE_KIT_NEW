import { useState } from 'react';

const ReportDownloadModal = ({ onClose, detections, currentPlant }) => {
  const [reportType, setReportType] = useState('incidents');
  const [fileFormat, setFileFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeImages, setIncludeImages] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState([]);

  const reportTypes = [
    { id: 'incidents', label: 'All Incidents Report', description: 'Complete list of all safety incidents' },
    { id: 'violations', label: 'PPE Violations Report', description: 'Detailed report of PPE compliance violations' },
    { id: 'area-wise', label: 'Area-wise Analysis', description: 'Incident breakdown by location/area' },
    { id: 'ppe-items', label: 'PPE Items Analysis', description: 'Statistics by PPE item type' },
    { id: 'trend-analysis', label: 'Trend Analysis', description: 'Incident trends over time' },
    { id: 'compliance', label: 'Compliance Summary', description: 'Overall compliance statistics' },
    { id: 'worker-specific', label: 'Worker-Specific Report', description: 'Individual worker compliance history' },
    { id: 'camera-uptime', label: 'Camera Uptime Report', description: 'System uptime and performance metrics' }
  ];

  const fileFormats = [
    { id: 'pdf', label: 'PDF', icon: '📄', description: 'Portable Document Format' },
    { id: 'excel', label: 'Excel', icon: '📊', description: 'Microsoft Excel Spreadsheet' },
    { id: 'csv', label: 'CSV', icon: '📋', description: 'Comma-Separated Values' },
    { id: 'json', label: 'JSON', icon: '{ }', description: 'JavaScript Object Notation' }
  ];

  const dateRanges = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Last 7 Days' },
    { id: 'month', label: 'Last 30 Days' },
    { id: 'quarter', label: 'Last 3 Months' },
    { id: 'year', label: 'Last Year' },
    { id: 'custom', label: 'Custom Range' }
  ];

  const areas = currentPlant?.zones || [
    'Assembly Line A',
    'Assembly Line B',
    'Welding Section',
    'Paint Shop',
    'Quality Control',
    'Warehouse'
  ];

  const toggleArea = (area) => {
    setSelectedAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const selectAllAreas = () => {
    setSelectedAreas(areas);
  };

  const clearAllAreas = () => {
    setSelectedAreas([]);
  };

  const handleDownload = () => {
    // Simulate download process
    const reportConfig = {
      reportType,
      fileFormat,
      dateRange,
      startDate: dateRange === 'custom' ? startDate : null,
      endDate: dateRange === 'custom' ? endDate : null,
      includeCharts,
      includeImages,
      selectedAreas: reportType === 'area-wise' ? selectedAreas : null,
      plant: currentPlant?.name || 'Unknown Plant',
      generatedAt: new Date().toISOString()
    };

    console.log('Downloading report with config:', reportConfig);

    // Create dummy file for demonstration
    const fileName = `${reportType}-report-${Date.now()}.${fileFormat === 'excel' ? 'xlsx' : fileFormat}`;

    // Show success message
    alert(`Report "${fileName}" is being generated and will be downloaded shortly!`);

    // In a real application, you would:
    // 1. Call an API endpoint to generate the report
    // 2. Receive the file blob
    // 3. Trigger browser download
    // Example:
    // const blob = await generateReport(reportConfig);
    // const url = window.URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = fileName;
    // a.click();

    onClose();
  };

  const isValidDateRange = () => {
    if (dateRange !== 'custom') return true;
    if (!startDate || !endDate) return false;
    return new Date(endDate) >= new Date(startDate);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black bg-opacity-70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between pb-5 mb-6 border-b-2 border-gray-200">
            <div>
              <h3 className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Report
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Generate and download comprehensive safety reports
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-11 h-11 text-2xl text-gray-600 transition-all duration-200 bg-gray-100 rounded-full hover:bg-gray-200 hover:rotate-90"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="space-y-6">
            {/* Report Type Selection */}
            <div>
              <h4 className="flex items-center gap-2 mb-3 text-sm font-bold tracking-wide text-gray-700 uppercase">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Report Type
              </h4>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {reportTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id)}
                    className={`p-4 text-left border-2 rounded-xl transition-all ${
                      reportType === type.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-800">{type.label}</div>
                    <div className="mt-1 text-xs text-gray-500">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* File Format Selection */}
            <div>
              <h4 className="flex items-center gap-2 mb-3 text-sm font-bold tracking-wide text-gray-700 uppercase">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                File Format
              </h4>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {fileFormats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setFileFormat(format.id)}
                    className={`p-4 text-center border-2 rounded-xl transition-all ${
                      fileFormat === format.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="mb-2 text-2xl">{format.icon}</div>
                    <div className="font-semibold text-gray-800">{format.label}</div>
                    <div className="mt-1 text-xs text-gray-500">{format.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Selection */}
            <div>
              <h4 className="flex items-center gap-2 mb-3 text-sm font-bold tracking-wide text-gray-700 uppercase">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date Range
              </h4>
              <div className="grid grid-cols-3 gap-2 mb-4 md:grid-cols-6">
                {dateRanges.map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setDateRange(range.id)}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                      dateRange === range.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              {dateRange === 'custom' && (
                <div className="grid grid-cols-1 gap-3 p-4 border-2 border-blue-200 md:grid-cols-2 rounded-xl bg-blue-50">
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-700">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Area Selection (only for area-wise reports) */}
            {reportType === 'area-wise' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="flex items-center gap-2 text-sm font-bold tracking-wide text-gray-700 uppercase">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Select Areas
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllAreas}
                      className="px-3 py-1 text-xs font-semibold text-blue-600 transition-colors bg-blue-100 rounded-lg hover:bg-blue-200"
                    >
                      Select All
                    </button>
                    <button
                      onClick={clearAllAreas}
                      className="px-3 py-1 text-xs font-semibold text-gray-600 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {areas.map((area) => (
                    <button
                      key={area}
                      onClick={() => toggleArea(area)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        selectedAreas.includes(area)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Options */}
            <div>
              <h4 className="flex items-center gap-2 mb-3 text-sm font-bold tracking-wide text-gray-700 uppercase">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Additional Options
              </h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Include Charts & Graphs</div>
                    <div className="text-xs text-gray-500">Add visual analytics to the report</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={includeImages}
                    onChange={(e) => setIncludeImages(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Include Detection Images</div>
                    <div className="text-xs text-gray-500">Embed actual detection photos (increases file size)</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 border-2 border-blue-200 rounded-xl bg-blue-50">
              <h4 className="mb-2 text-sm font-bold text-blue-900">Report Summary</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p><span className="font-semibold">Type:</span> {reportTypes.find(t => t.id === reportType)?.label}</p>
                <p><span className="font-semibold">Format:</span> {fileFormats.find(f => f.id === fileFormat)?.label}</p>
                <p><span className="font-semibold">Period:</span> {dateRanges.find(d => d.id === dateRange)?.label}</p>
                {reportType === 'area-wise' && (
                  <p><span className="font-semibold">Areas:</span> {selectedAreas.length > 0 ? selectedAreas.length : 'All'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-6 mt-6 border-t-2 border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={!isValidDateRange() || (reportType === 'area-wise' && selectedAreas.length === 0)}
              className={`flex-1 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all ${
                isValidDateRange() && (reportType !== 'area-wise' || selectedAreas.length > 0)
                  ? 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Report
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDownloadModal;
