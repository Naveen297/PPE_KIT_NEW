import { useEffect, useState } from 'react';
import { Loader2, VideoOff, WifiOff } from 'lucide-react';

const STATUS_META = {
  idle: { label: 'OFFLINE', dot: 'bg-gray-500' },
  connecting: { label: 'CONNECTING', dot: 'bg-amber-400 animate-pulse' },
  waiting: { label: 'WAITING FOR FEED', dot: 'bg-amber-400 animate-pulse' },
  live: { label: 'LIVE FEED', dot: 'bg-red-500 animate-pulse' },
  error: { label: 'CONNECTION ERROR', dot: 'bg-red-600' },
};

/** Small live clock for the overlay header. */
const useClock = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
};

/**
 * CameraPanel — renders the selected camera's annotated WebSocket frames.
 *
 * @param {Object}  props
 * @param {boolean} props.isStreaming
 * @param {string}  props.cameraName
 * @param {string|null} props.frameUrl - Object URL of the latest JPEG frame.
 * @param {string}  props.status       - idle | connecting | waiting | live | error
 */
const CameraPanel = ({ isStreaming, cameraName, frameUrl, status }) => {
  const now = useClock();
  const meta = STATUS_META[status] ?? STATUS_META.idle;

  return (
    <div className="relative flex flex-col flex-1 overflow-hidden bg-black border border-gray-800 shadow-lg rounded-2xl">
      {/* Overlay header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${meta.dot}`} />
            <span className="font-mono text-sm tracking-wider text-white uppercase">{meta.label}</span>
          </div>
          {cameraName && (
            <div className="mt-1 font-mono text-xs text-gray-300">{cameraName}</div>
          )}
        </div>
        <div className="font-mono text-sm text-white/80">{now.toLocaleTimeString()}</div>
      </div>

      {/* Feed area */}
      <div className="flex items-center justify-center flex-1 bg-gray-900">
        {isStreaming && frameUrl ? (
          <img
            src={frameUrl}
            className="object-contain w-full h-full"
            alt={`Live feed — ${cameraName}`}
          />
        ) : isStreaming ? (
          // Streaming requested but no frame yet (connecting / waiting / error).
          <div className="text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 text-gray-500 bg-gray-800 rounded-full">
              {status === 'error' ? (
                <WifiOff className="w-9 h-9" aria-hidden="true" />
              ) : (
                <Loader2 className="w-9 h-9 animate-spin" aria-hidden="true" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-300">
              {status === 'error' ? 'Stream connection failed' : 'Connecting to camera…'}
            </h3>
            <p className="max-w-xs mx-auto mt-2 text-sm text-gray-500">
              {status === 'error'
                ? 'Could not open the video socket. Check that the backend is running and the camera is online.'
                : 'Waiting for the first annotated frame. Cameras with no live feed send nothing.'}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 text-gray-600 bg-gray-800 rounded-full">
              <VideoOff className="w-10 h-10" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400">Camera Feed Offline</h3>
            <p className="max-w-xs mx-auto mt-2 text-sm text-gray-500">
              Select a camera from the configuration panel and start the stream.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraPanel;
