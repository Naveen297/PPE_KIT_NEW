import { useMemo } from 'react';
import { ConfidenceBar, PPEItemChip } from '@/components/ui';

const MAX_DISPLAYED = 10;

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

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
      <div className="flex flex-col gap-4 justify-between items-start mb-6 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            PPE Violations
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing {displayed.length} of {violationDetections.length} violations detected
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border-2 border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              {['Timestamp', 'Location', 'Status', 'Missing PPE Items', 'Confidence', 'Action'].map(
                (heading, idx) => (
                  <th
                    key={heading}
                    className={`px-4 py-4 text-xs font-bold tracking-wider text-gray-600 uppercase ${
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
                    <svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 font-medium">No violations detected — All workers are compliant!</p>
                  </div>
                </td>
              </tr>
            ) : (
              displayed.map((detection) => (
                <tr key={detection.id} className="transition-colors duration-150 hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {detection.timestamp}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {detection.location}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Violation
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {detection.missingItems.map((item) => (
                        <PPEItemChip key={item} label={item} variant="missing" />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <ConfidenceBar value={detection.confidence} size="sm" />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => onViewDetails(detection)}
                      className="inline-flex items-center justify-center w-10 h-10 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 transform hover:scale-110"
                      title="View Details"
                      aria-label={`View details for detection ${detection.id}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DetectionsTable;
