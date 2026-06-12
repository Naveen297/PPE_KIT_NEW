import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { getCombinedReport } from '@/api';
import { downloadBlob, toCsv, toExcelHtml } from '@/utils/download';

const REPORT_TYPES = [
  { id: 'incidents', label: 'All Incidents Report', description: 'Every detection in the period' },
  { id: 'violations', label: 'PPE Violations Report', description: 'Only PPE compliance violations' },
  { id: 'area-wise', label: 'Area-wise Analysis', description: 'Violation counts grouped by zone' },
  { id: 'ppe-items', label: 'PPE Items Analysis', description: 'Counts by missing PPE item' },
  { id: 'trend-analysis', label: 'Trend Analysis', description: 'Violations per day' },
  { id: 'compliance', label: 'Compliance Summary', description: 'Overall compliance statistics' },
];

const FILE_FORMATS = [
  { id: 'csv', label: 'CSV', icon: '📋', description: 'Comma-Separated Values' },
  { id: 'json', label: 'JSON', icon: '{ }', description: 'JavaScript Object Notation' },
  { id: 'excel', label: 'Excel', icon: '📊', description: 'Opens in Microsoft Excel' },
  { id: 'pdf', label: 'PDF', icon: '📄', description: 'Print-ready document' },
];

const DATE_RANGES = [
  { id: 'today', label: 'Today', days: 0 },
  { id: 'week', label: 'Last 7 Days', days: 6 },
  { id: 'month', label: 'Last 30 Days', days: 29 },
  { id: 'quarter', label: 'Last 3 Months', days: 89 },
  { id: 'year', label: 'Last Year', days: 364 },
  { id: 'custom', label: 'Custom Range', days: null },
];

const toISODate = (d) => d.toISOString().split('T')[0];

/** Resolve the chosen range to { start_date, end_date } (YYYY-MM-DD). */
const resolveRange = (dateRange, startDate, endDate) => {
  if (dateRange === 'custom') return { start_date: startDate, end_date: endDate };
  const preset = DATE_RANGES.find((r) => r.id === dateRange);
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (preset?.days ?? 6));
  return { start_date: toISODate(start), end_date: toISODate(end) };
};

const isViolation = (r) => r.status === 'violation';
const splitItems = (s) =>
  (s || '')
    .split(/[,;]/)
    .map((x) => x.trim())
    .filter(Boolean);

/** Shape the raw combined-report rows into { columns, rows } for the report type. */
const buildDataset = (type, rows) => {
  switch (type) {
    case 'violations':
    case 'incidents': {
      const source = type === 'violations' ? rows.filter(isViolation) : rows;
      return {
        columns: [
          { key: 'id', label: 'ID' },
          { key: 'timestamp', label: 'Timestamp' },
          { key: 'camera_name', label: 'Camera' },
          { key: 'area', label: 'Area' },
          { key: 'status', label: 'Status' },
          { key: 'missing_items', label: 'Missing Items' },
          { key: 'risk_level', label: 'Risk Level' },
          { key: 'confidence', label: 'Confidence (%)' },
        ],
        rows: source.map((r) => ({
          id: r.id,
          timestamp: r.timestamp,
          camera_name: r.camera_name,
          area: r.area,
          status: r.status,
          missing_items: r.missing_items,
          risk_level: r.risk_level,
          confidence: r.confidence,
        })),
      };
    }
    case 'area-wise': {
      const counts = {};
      rows.filter(isViolation).forEach((r) => {
        const area = r.area || r.camera_name || 'Unknown';
        counts[area] = (counts[area] ?? 0) + 1;
      });
      return {
        columns: [
          { key: 'area', label: 'Area' },
          { key: 'violations', label: 'Violations' },
        ],
        rows: Object.entries(counts)
          .map(([area, violations]) => ({ area, violations }))
          .sort((a, b) => b.violations - a.violations),
      };
    }
    case 'ppe-items': {
      const counts = {};
      rows.filter(isViolation).forEach((r) => {
        splitItems(r.missing_items).forEach((item) => {
          counts[item] = (counts[item] ?? 0) + 1;
        });
      });
      return {
        columns: [
          { key: 'item', label: 'Missing PPE Item' },
          { key: 'count', label: 'Occurrences' },
        ],
        rows: Object.entries(counts)
          .map(([item, count]) => ({ item, count }))
          .sort((a, b) => b.count - a.count),
      };
    }
    case 'trend-analysis': {
      const counts = {};
      rows.filter(isViolation).forEach((r) => {
        const day = (r.timestamp || '').split('T')[0] || 'Unknown';
        counts[day] = (counts[day] ?? 0) + 1;
      });
      return {
        columns: [
          { key: 'date', label: 'Date' },
          { key: 'violations', label: 'Violations' },
        ],
        rows: Object.entries(counts)
          .map(([date, violations]) => ({ date, violations }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      };
    }
    case 'compliance':
    default: {
      const total = rows.length;
      const violations = rows.filter(isViolation).length;
      const compliant = total - violations;
      const rate = total > 0 ? ((compliant / total) * 100).toFixed(1) : '0.0';
      return {
        columns: [
          { key: 'metric', label: 'Metric' },
          { key: 'value', label: 'Value' },
        ],
        rows: [
          { metric: 'Total Detections', value: total },
          { metric: 'Compliant', value: compliant },
          { metric: 'Violations', value: violations },
          { metric: 'Compliance Rate (%)', value: rate },
        ],
      };
    }
  }
};

/** Open a print-ready window so the user can "Save as PDF". */
const printDataset = (title, columns, rows) => {
  const win = window.open('', '_blank');
  if (!win) return false;
  const head = columns.map((c) => `<th>${c.label}</th>`).join('');
  const body = rows
    .map((row) => `<tr>${columns.map((c) => `<td>${row[c.key] ?? ''}</td>`).join('')}</tr>`)
    .join('');
  win.document.write(`
    <html><head><title>${title}</title>
    <style>
      body{font-family:system-ui,Arial,sans-serif;padding:24px;color:#111}
      h1{font-size:18px;margin:0 0 4px}
      p{color:#666;font-size:12px;margin:0 0 16px}
      table{border-collapse:collapse;width:100%;font-size:12px}
      th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
      th{background:#f3f4f6}
    </style></head><body>
    <h1>${title}</h1><p>Generated ${new Date().toLocaleString()}</p>
    <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
    <script>window.onload=function(){window.print()}</script>
    </body></html>`);
  win.document.close();
  return true;
};

/**
 * ReportDownloadModal — generates real report files from the
 * `/get_combined_report` endpoint in the chosen format.
 */
const ReportDownloadModal = ({ onClose }) => {
  const [reportType, setReportType] = useState('violations');
  const [fileFormat, setFileFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [state, setState] = useState({ loading: false, error: null, success: null });

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const isValidDateRange = () => {
    if (dateRange !== 'custom') return true;
    if (!startDate || !endDate) return false;
    return new Date(endDate) >= new Date(startDate);
  };
  const canDownload = isValidDateRange() && !state.loading;

  const handleDownload = useCallback(async () => {
    setState({ loading: true, error: null, success: null });
    try {
      const range = resolveRange(dateRange, startDate, endDate);
      const res = await getCombinedReport({
        camera_name: 'all',
        ...range,
        page: 1,
        limit: 2000,
      });
      const rows = res?.data ?? [];
      const { columns, rows: shaped } = buildDataset(reportType, rows);

      if (shaped.length === 0) {
        setState({ loading: false, error: 'No data found for the selected period.', success: null });
        return;
      }

      const stamp = new Date().toISOString().split('T')[0];
      const base = `${reportType}-report-${stamp}`;
      const title = `${REPORT_TYPES.find((t) => t.id === reportType)?.label} (${range.start_date} → ${range.end_date})`;

      if (fileFormat === 'json') {
        downloadBlob(`${base}.json`, JSON.stringify(shaped, null, 2), 'application/json');
      } else if (fileFormat === 'csv') {
        downloadBlob(`${base}.csv`, toCsv(columns, shaped), 'text/csv;charset=utf-8');
      } else if (fileFormat === 'excel') {
        downloadBlob(`${base}.xls`, toExcelHtml(columns, shaped, title), 'application/vnd.ms-excel');
      } else if (fileFormat === 'pdf') {
        const ok = printDataset(title, columns, shaped);
        if (!ok) {
          setState({ loading: false, error: 'Pop-up blocked — allow pop-ups to export PDF, or choose another format.', success: null });
          return;
        }
      }

      setState({ loading: false, error: null, success: `Report ready — ${shaped.length} row(s) exported.` });
      setTimeout(onClose, 1400);
    } catch (err) {
      setState({ loading: false, error: err.message || 'Failed to generate the report.', success: null });
    }
  }, [reportType, fileFormat, dateRange, startDate, endDate, onClose]);

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
              <p className="mt-1 text-sm text-gray-600">Generate a report from live detection data</p>
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

            {/* Summary */}
            <div className="p-4 border-2 border-blue-200 rounded-xl bg-blue-50">
              <h4 className="mb-2 text-sm font-bold text-blue-900">Report Summary</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p><span className="font-semibold">Type:</span> {REPORT_TYPES.find((t) => t.id === reportType)?.label}</p>
                <p><span className="font-semibold">Format:</span> {FILE_FORMATS.find((f) => f.id === fileFormat)?.label}</p>
                <p><span className="font-semibold">Period:</span> {DATE_RANGES.find((d) => d.id === dateRange)?.label}</p>
              </div>
            </div>

            {/* Feedback */}
            {state.error && (
              <div className="p-3 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl text-center">
                ⚠️ {state.error}
              </div>
            )}
            {state.success && (
              <div className="p-3 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-xl text-center">
                ✅ {state.success}
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
                canDownload ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {state.loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  Generating…
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDownloadModal;
