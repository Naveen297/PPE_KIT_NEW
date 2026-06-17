import { clsx } from 'clsx';
import { Camera, Loader2, Play, Square, RefreshCw, Power, AlertTriangle } from 'lucide-react';

/**
 * CameraConfigSidebar — left panel for LiveMonitoring. Lists the real cameras
 * returned by `GET /cameras` (with live/offline status) and controls streaming.
 *
 * @param {Object}   props
 * @param {Array}    props.cameras        - [{ name, online }]
 * @param {boolean}  props.loading
 * @param {Error|null} props.error
 * @param {Function} props.onRetry
 * @param {string}   props.selectedCamera
 * @param {Function} props.onSelectCamera
 * @param {boolean}  props.isStreaming
 * @param {Function} props.onStartStream
 * @param {Function} props.onStopStream
 * @param {string}   props.plantName
 * @param {string|null} props.validationError
 * @param {Function} props.onStartBackend
 * @param {{loading:boolean, message:string|null, error:boolean}} props.backend
 */

const DETECTION_INDICATORS = [
  { label: 'Helmet', color: 'bg-red-500' },
  { label: 'Apron', color: 'bg-yellow-500' },
  { label: 'Person', color: 'bg-green-500' },
];

const CameraConfigSidebar = ({
  cameras = [],
  loading,
  error,
  onRetry,
  selectedCamera,
  onSelectCamera,
  isStreaming,
  onStartStream,
  onStopStream,
  plantName,
  validationError,
  onStartBackend,
  backend = { loading: false, message: null, error: false },
}) => (
  <div className="flex flex-col w-1/5 min-w-[240px] overflow-hidden bg-white border border-gray-200 shadow-md rounded-2xl">
    {/* Header */}
    <div className="p-5 border-b border-gray-100 bg-gray-50">
      <h3 className="flex items-center gap-2 font-bold text-gray-800">
        <Camera className="w-5 h-5 text-blue-600" aria-hidden="true" />
        Camera Config
      </h3>
      <p className="mt-1 text-xs text-gray-500">{plantName}</p>
    </div>

    {/* Camera list */}
    <div className="flex-1 p-5 space-y-5 overflow-y-auto">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-gray-600 uppercase">Camera</label>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 text-2xs font-semibold text-blue-600 hover:text-blue-700"
            title="Refresh camera list"
          >
            <RefreshCw className="w-3 h-3" aria-hidden="true" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-start gap-2 p-3 text-xs border rounded-lg border-rose-200 bg-rose-50 text-rose-700">
            <span className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              {error.isNetwork ? 'Backend unreachable' : 'Could not load cameras'}
            </span>
            <span className="text-rose-600">{error.message}</span>
            <button onClick={onRetry} className="font-semibold text-rose-700 underline">Try again</button>
          </div>
        ) : cameras.length === 0 ? (
          <p className="py-6 text-xs text-center text-gray-400">No cameras configured.</p>
        ) : (
          <div className="space-y-1.5">
            {cameras.map((cam) => {
              const active = selectedCamera === cam.name;
              return (
                <button
                  key={cam.name}
                  onClick={() => onSelectCamera(cam.name)}
                  disabled={isStreaming}
                  className={clsx(
                    'flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all disabled:cursor-not-allowed disabled:opacity-60',
                    active
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300',
                  )}
                >
                  <span className="truncate font-medium">{cam.name}</span>
                  <span
                    className={clsx(
                      'flex items-center gap-1 text-2xs font-semibold uppercase flex-shrink-0',
                      cam.online ? 'text-emerald-600' : 'text-gray-400',
                    )}
                  >
                    <span className={clsx('w-2 h-2 rounded-full', cam.online ? 'bg-emerald-500' : 'bg-gray-300')} />
                    {cam.online ? 'Live' : 'Off'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Inline validation */}
      {validationError && (
        <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {validationError}
        </p>
      )}

      {/* Start backend engine */}
      <div className="pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onStartBackend}
          disabled={backend.loading}
          className="flex items-center justify-center w-full gap-2 py-2.5 text-sm font-semibold text-gray-700 transition-all bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-60"
        >
          {backend.loading ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Power className="w-4 h-4" aria-hidden="true" />
          )}
          Start Detection Engine
        </button>
        {backend.message && (
          <p
            className={clsx(
              'mt-2 text-2xs font-medium px-2.5 py-1.5 rounded-lg',
              backend.error ? 'text-red-600 bg-red-50' : 'text-emerald-700 bg-emerald-50',
            )}
          >
            {backend.message}
          </p>
        )}
      </div>

      {/* Detection indicators legend */}
      <div className="pt-4 mt-2 border-t border-gray-100">
        <label className="block mb-3 text-xs font-bold text-gray-600 uppercase">Detection Classes</label>
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
          <Square className="w-5 h-5" aria-hidden="true" />
          Stop Stream
        </button>
      ) : (
        <button
          id="start-stream-btn"
          onClick={onStartStream}
          className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition-all bg-blue-600 shadow-md hover:bg-blue-700 rounded-xl"
        >
          <Play className="w-5 h-5" aria-hidden="true" />
          Start Stream
        </button>
      )}
    </div>
  </div>
);

export default CameraConfigSidebar;
