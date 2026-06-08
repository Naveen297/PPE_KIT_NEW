import { useEffect } from 'react';
import DummyImage from '@/assets/DummyImage.jpg';
import { ConfidenceBar, PPEItemChip } from '@/components/ui';
import { getConfidenceLabel, getConfidenceColor } from '@/utils/formatters';

/**
 * DetailRow — A labelled info block inside the modal.
 */
const DetailRow = ({ icon, label, children }) => (
  <div className="p-5 bg-gray-50 rounded-xl border-2 border-gray-200">
    <div className="flex items-center gap-2 mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
      {icon}
      {label}
    </div>
    {children}
  </div>
);

/**
 * DetectionModal — Full-screen overlay showing detection event details.
 *
 * @param {Object}   props
 * @param {Object}   props.detection - Detection record to display.
 * @param {Function} props.onClose   - Close handler.
 */
const DetectionModal = ({ detection, onClose }) => {
  const confidence = parseFloat(detection.confidence);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="flex fixed inset-0 z-50 justify-center items-center p-5 bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Detection details"
    >
      <div
        className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center pb-5 mb-6 border-b-2 border-gray-200">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Detection Details
              </h3>
              <p className="text-sm text-gray-600 mt-1">ID: {detection.id}</p>
            </div>
            <button
              onClick={onClose}
              className="flex justify-center items-center w-11 h-11 text-2xl bg-gray-100 rounded-full transition-all duration-200 hover:bg-gray-200 hover:rotate-90 text-gray-600"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Image */}
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={DummyImage}
                  alt="PPE Detection snapshot"
                  className="w-full rounded-2xl shadow-lg border-2 border-gray-200"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-lg text-white ${
                      detection.status === 'compliant' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    {detection.status === 'compliant' ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        Compliant
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Violation
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-4">
              <DetailRow
                label="Timestamp"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              >
                <div className="text-base font-semibold text-gray-900">{detection.timestamp}</div>
              </DetailRow>

              <DetailRow
                label="Location"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              >
                <div className="text-base font-semibold text-gray-900">{detection.location}</div>
              </DetailRow>

              <DetailRow
                label="PPE Items"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
              >
                <div className="flex flex-wrap gap-2">
                  {detection.ppeItems.map((item) => (
                    <PPEItemChip key={item} label={item} variant="present" />
                  ))}
                  {detection.missingItems.map((item) => (
                    <PPEItemChip key={item} label={item} variant="missing" />
                  ))}
                </div>
              </DetailRow>

              <DetailRow
                label="Confidence Score"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-gray-900">{confidence}%</span>
                  <span className={`text-xs font-semibold ${getConfidenceColor(confidence)}`}>
                    {getConfidenceLabel(confidence)}
                  </span>
                </div>
                <ConfidenceBar value={confidence} size="lg" showLabel={false} />
              </DetailRow>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectionModal;
