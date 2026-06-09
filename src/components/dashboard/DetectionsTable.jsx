import { useMemo } from 'react';
import { AlertTriangle, Eye, MapPin, ShieldAlert } from 'lucide-react';
import { ConfidenceBar } from '@/components/ui';

const MAX_DISPLAYED = 8;

const getRiskMeta = (missingCount) => {
  if (missingCount >= 3) {
    return { label: 'Critical', className: 'bg-red-100 text-red-700 ring-red-200' };
  }
  if (missingCount === 2) {
    return { label: 'High', className: 'bg-orange-100 text-orange-700 ring-orange-200' };
  }
  return { label: 'Medium', className: 'bg-amber-100 text-amber-700 ring-amber-200' };
};

const formatCompactTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return { date: timestamp, time: '' };
  }

  return {
    date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
  };
};

/**
 * DetectionsTable — Paginated table of PPE violation events.
 *
 * @param {Object}   props
 * @param {Array}    props.detections    - All detection records.
 * @param {Function} props.onViewDetails - Called with a detection object when "View" is clicked.
 */
const DetectionsTable = ({ detections, onViewDetails }) => {
  const violationDetections = useMemo(
    () => detections.filter((d) => d.status === 'violation'),
    [detections],
  );

  const displayed = violationDetections.slice(0, MAX_DISPLAYED);
  const criticalCount = useMemo(
    () => violationDetections.filter((d) => (d.missingItems?.length ?? 0) >= 3).length,
    [violationDetections],
  );
  const averageConfidence = useMemo(() => {
    if (violationDetections.length === 0) return 0;
    const total = violationDetections.reduce((sum, d) => sum + Number.parseFloat(d.confidence || 0), 0);
    return (total / violationDetections.length).toFixed(1);
  }, [violationDetections]);

  return (
    <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
      <div className="flex flex-col gap-4 mb-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-red-600 rounded-lg bg-red-50">
            <ShieldAlert className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">PPE Violation Table</h2>
            <p className="mt-1 text-sm text-gray-600">
              Showing latest {displayed.length} of {violationDetections.length} violation events
            </p>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 xl:w-auto">
          <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Total</p>
            <p className="text-sm font-bold text-gray-900">{violationDetections.length} violations</p>
          </div>
          <div className="px-3 py-2 border border-red-100 rounded-lg bg-red-50">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-red-500">Critical</p>
            <p className="text-sm font-bold text-red-700">{criticalCount} events</p>
          </div>
          <div className="px-3 py-2 border border-blue-100 rounded-lg bg-blue-50">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-500">Avg confidence</p>
            <p className="text-sm font-bold text-blue-700">{averageConfidence}%</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden border border-gray-200 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['Time', 'Area', 'Severity', 'Missing PPE', 'Confidence', 'Action'].map(
                  (heading, idx) => (
                    <th
                      key={heading}
                      className={`px-4 py-3 text-xs font-bold tracking-wider text-gray-500 uppercase ${
                        idx === 5 ? 'text-center' : 'text-left'
                      }`}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 text-green-500 rounded-full bg-green-50">
                        <ShieldAlert className="w-6 h-6" aria-hidden="true" />
                      </div>
                      <p className="font-medium text-gray-500">No violations detected - all workers are compliant.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayed.map((detection) => {
                  const risk = getRiskMeta(detection.missingItems?.length ?? 0);
                  const timestamp = formatCompactTimestamp(detection.timestamp);
                  const missingItems = detection.missingItems ?? [];

                  return (
                    <tr key={detection.id} className="transition-colors duration-150 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">{timestamp.date}</div>
                        <div className="text-xs text-gray-500">{timestamp.time}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <div className="flex items-center gap-2">
                          <MapPin className="flex-shrink-0 w-4 h-4 text-gray-400" aria-hidden="true" />
                          <span className="font-medium text-gray-800">{detection.location}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ${risk.className}`}>
                          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                          {risk.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5 max-w-sm">
                          {missingItems.map((item) => (
                            <span
                              key={item}
                              className="inline-flex items-center px-2 py-1 text-xs font-semibold text-red-700 rounded-md bg-red-50 ring-1 ring-red-100"
                            >
                              {item.replace('Safety ', '')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ConfidenceBar value={detection.confidence} size="sm" showLabel={false} />
                          <span className="w-12 text-xs font-bold text-right text-gray-800 tabular-nums">
                            {detection.confidence}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => onViewDetails(detection)}
                          className="inline-flex items-center justify-center w-9 h-9 text-blue-600 transition-colors duration-200 rounded-lg bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
                          title="View Details"
                          aria-label={`View details for detection ${detection.id}`}
                        >
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DetectionsTable;
