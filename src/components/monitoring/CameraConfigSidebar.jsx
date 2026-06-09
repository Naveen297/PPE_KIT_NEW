/**
 * CameraConfigSidebar — Left panel for LiveMonitoring.
 * Handles camera area selection, detection indicators, and stream control.
 *
 * @param {Object}   props
 * @param {{ area }}  props.config                  - Current selection state.
 * @param {Function} props.onConfigChange           - Called with updated config object.
 * @param {boolean}  props.isStreaming              - Whether stream is active.
 * @param {Function} props.onStartStream            - Start stream handler.
 * @param {Function} props.onStopStream             - Stop stream handler.
 * @param {string}   props.plantName               - Current plant display name.
 * @param {string|null} props.validationError       - Inline validation message.
 */

const AREAS = [
  'Main Road Area / Scrap yard rooftop',
  'Stores Bolero / Engine Line',
  'Bolero PC Store 1',
  'Fabrication PTZ',
  'Bolero Doc 2',
  'Bolero Doc 1',
  'Plant 2 Dock Camera',
  'Bolero Dock PTZ',
  'S1T Dock',
  'S1T Dock Toward PC Store',
  'S1T Store Near Old D2D Line',
];

const DETECTION_INDICATORS = [
  { label: 'Helmet',  color: 'bg-red-500' },
  { label: 'Gloves',  color: 'bg-blue-500' },
  { label: 'Apron',   color: 'bg-yellow-500' },
  { label: 'Mobile',  color: 'bg-purple-500' },
  { label: 'Shoes',   color: 'bg-green-500' },
  { label: 'Goggles', color: 'bg-orange-500' },
];

const SelectField = ({ label, value, options, onChange, disabled }) => (
  <div>
    <label className="block mb-2 text-xs font-bold text-gray-600 uppercase">{label}</label>
    <select
      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-60"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      <option value="">-- Select {label} --</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const CameraConfigSidebar = ({
  config,
  onConfigChange,
  isStreaming,
  onStartStream,
  onStopStream,
  plantName,
  validationError,
}) => (
  <div className="flex flex-col w-1/5 overflow-hidden bg-white border border-gray-200 shadow-md rounded-2xl">
    {/* Header */}
    <div className="p-5 border-b border-gray-100 bg-gray-50">
      <h3 className="flex items-center gap-2 font-bold text-gray-800">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Camera Config
      </h3>
      <p className="mt-1 text-xs text-gray-500">{plantName}</p>
    </div>

    {/* Config fields */}
    <div className="flex-1 p-5 space-y-5 overflow-y-auto">
      <SelectField
        label="Area"
        value={config.area}
        options={AREAS}
        onChange={(v) => onConfigChange({ ...config, area: v })}
        disabled={isStreaming}
      />

      {/* Inline validation */}
      {validationError && (
        <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {validationError}
        </p>
      )}

      {/* Detection indicators legend */}
      <div className="pt-4 mt-2 border-t border-gray-100">
        <label className="block mb-3 text-xs font-bold text-gray-600 uppercase">Detection Indicators</label>
        <div className="grid grid-cols-2 gap-2">
          {DETECTION_INDICATORS.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${color} shadow-sm flex-shrink-0`} />
              <span className="text-xs font-medium text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Stream control */}
    <div className="p-5 border-t border-gray-200 bg-gray-50">
      {isStreaming ? (
        <button
          id="stop-stream-btn"
          onClick={onStopStream}
          className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition-all bg-red-500 shadow-md hover:bg-red-600 rounded-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
          Stop Stream
        </button>
      ) : (
        <button
          id="start-stream-btn"
          onClick={onStartStream}
          className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition-all bg-blue-600 shadow-md hover:bg-blue-700 rounded-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Start Stream
        </button>
      )}
    </div>
  </div>
);

export default CameraConfigSidebar;
