import { useState, useEffect, useCallback } from 'react';

const REPORT_TYPES = [
  { id: 'incidents',      label: 'All Incidents Report',     description: 'Complete list of all safety incidents' },
  { id: 'violations',     label: 'PPE Violations Report',    description: 'Detailed report of PPE compliance violations' },
  { id: 'area-wise',      label: 'Area-wise Analysis',       description: 'Incident breakdown by location/area' },
  { id: 'ppe-items',      label: 'PPE Items Analysis',       description: 'Statistics by PPE item type' },
  { id: 'trend-analysis', label: 'Trend Analysis',           description: 'Incident trends over time' },
  { id: 'compliance',     label: 'Compliance Summary',       description: 'Overall compliance statistics' },
  { id: 'worker-specific',label: 'Worker-Specific Report',   description: 'Individual worker compliance history' },
  { id: 'camera-uptime',  label: 'Camera Uptime Report',     description: 'System uptime and performance metrics' },
];

const FILE_FORMATS = [
  { id: 'pdf',   label: 'PDF',   icon: '📄', description: 'Portable Document Format' },
  { id: 'excel', label: 'Excel', icon: '📊', description: 'Microsoft Excel Spreadsheet' },
  { id: 'csv',   label: 'CSV',   icon: '📋', description: 'Comma-Separated Values' },
  { id: 'json',  label: 'JSON',  icon: '{ }', description: 'JavaScript Object Notation' },
];

const DATE_RANGES = [
  { id: 'today',   label: 'Today' },
  { id: 'week',    label: 'Last 7 Days' },
  { id: 'month',   label: 'Last 30 Days' },
  { id: 'quarter', label: 'Last 3 Months' },
  { id: 'year',    label: 'Last Year' },
  { id: 'custom',  label: 'Custom Range' },
];

/**
 * ReportDownloadModal — Multi-step report configuration and download modal.
 *
 * @param {Object}   props
 * @param {Function} props.onClose       - Close handler.
 * @param {Array}    props.detections    - Detection records (for context).
 * @param {Object}   props.currentPlant  - Current plant object.
 */
const ReportDownloadModal = ({ onClose, currentPlant }) => {
  const [reportType, setReportType]       = useState('incidents');
  const [fileFormat, setFileFormat]       = useState('pdf');
  const [dateRange, setDateRange]         = useState('week');
  const [startDate, setStartDate]         = useState('');
  const [endDate, setEndDate]             = useState('');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeImages, setIncludeImages] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState(null); // 'success' | null

  const areas = currentPlant?.zones ?? ['Assembly Line A', 'Assembly Line B', 'Welding Section', 'Paint Shop', 'Quality Control', 'Warehouse'];

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const toggleArea = useCallback((area) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
    );
  }, []);

  const isValidDateRange = () => {
    if (dateRange !== 'custom') return true;
    if (!startDate || !endDate) return false;
    return new Date(endDate) >= new Date(startDate);
  };

  const canDownload = isValidDateRange() && (reportType !== 'area-wise' || selectedAreas.length > 0);

  const handleDownload = () => {
    const ext = fileFormat === 'excel' ? 'xlsx' : fileFormat;
    const fileName = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${ext}`;
    // In production: call API → receive blob → trigger download
    console.info('[ReportDownloadModal] Generating report:', { reportType, fileFormat, dateRange, fileName });
    setDownloadStatus('success');
    setTimeout(onClose, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black bg-opacity-70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Download report"
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
              <p className="mt-1 text-sm text-gray-600">Generate and download comprehensive safety reports</p>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-11 h-11 text-2xl text-gray-600 transition-all duration-200 bg-gray-100 rounded-full hover:bg-gray-200 hover:rotate-90"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Report Type */}
            <div>
              <h4 className="mb-3 text-sm font-bold tracking-wide text-gray-700 uppercase">Report Type</h4>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {REPORT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id)}
                    className={`p-4 text-left border-2 rounded-xl transition-all ${
                      reportType === type.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-800">{type.label}</div>
                    <div className="mt-1 text-xs text-gray-500">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* File Format */}
            <div>
              <h4 className="mb-3 text-sm font-bold tracking-wide text-gray-700 uppercase">File Format</h4>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {FILE_FORMATS.map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setFileFormat(fmt.id)}
                    className={`p-4 text-center border-2 rounded-xl transition-all ${
                      fileFormat === fmt.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="mb-2 text-2xl">{fmt.icon}</div>
                    <div className="font-semibold text-gray-800">{fmt.label}</div>
                    <div className="mt-1 text-xs text-gray-500">{fmt.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h4 className="mb-3 text-sm font-bold tracking-wide text-gray-700 uppercase">Date Range</h4>
              <div className="grid grid-cols-3 gap-2 mb-4 md:grid-cols-6">
                {DATE_RANGES.map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setDateRange(range.id)}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                      dateRange === range.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
              {dateRange === 'custom' && (
                <div className="grid grid-cols-1 gap-3 p-4 border-2 border-blue-200 md:grid-cols-2 rounded-xl bg-blue-50">
                  {[['Start Date', startDate, setStartDate], ['End Date', endDate, setEndDate]].map(([label, val, setter]) => (
                    <div key={label}>
                      <label className="block mb-1 text-xs font-semibold text-gray-700">{label}</label>
                      <input
                        type="date"
                        value={val}
                        onChange={(e) => setter(e.target.value)}
                        className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Area selection */}
            {reportType === 'area-wise' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold tracking-wide text-gray-700 uppercase">Select Areas</h4>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedAreas(areas)} className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200">Select All</button>
                    <button onClick={() => setSelectedAreas([])} className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Clear All</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {areas.map((area) => (
                    <button
                      key={area}
                      onClick={() => toggleArea(area)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        selectedAreas.includes(area) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              <h4 className="mb-3 text-sm font-bold tracking-wide text-gray-700 uppercase">Additional Options</h4>
              <div className="space-y-3">
                {[
                  { checked: includeCharts, onChange: setIncludeCharts, label: 'Include Charts & Graphs', desc: 'Add visual analytics to the report' },
                  { checked: includeImages, onChange: setIncludeImages, label: 'Include Detection Images', desc: 'Embed actual detection photos (increases file size)' },
                ].map(({ checked, onChange, label, desc }) => (
                  <label key={label} className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => onChange(e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-semibold text-gray-800">{label}</div>
                      <div className="text-xs text-gray-500">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 border-2 border-blue-200 rounded-xl bg-blue-50">
              <h4 className="mb-2 text-sm font-bold text-blue-900">Report Summary</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p><span className="font-semibold">Type:</span> {REPORT_TYPES.find((t) => t.id === reportType)?.label}</p>
                <p><span className="font-semibold">Format:</span> {FILE_FORMATS.find((f) => f.id === fileFormat)?.label}</p>
                <p><span className="font-semibold">Period:</span> {DATE_RANGES.find((d) => d.id === dateRange)?.label}</p>
                {reportType === 'area-wise' && (
                  <p><span className="font-semibold">Areas:</span> {selectedAreas.length > 0 ? selectedAreas.length : 'All'}</p>
                )}
              </div>
            </div>

            {/* Success feedback */}
            {downloadStatus === 'success' && (
              <div className="p-3 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-xl text-center">
                ✅ Report is being generated — download will start shortly!
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-6 mt-6 border-t-2 border-gray-200">
            <button onClick={onClose} className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={!canDownload}
              className={`flex-1 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all flex items-center justify-center gap-2 ${
                canDownload ? 'bg-blue-600 hover:bg-blue-700 hover:scale-105' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDownloadModal;
