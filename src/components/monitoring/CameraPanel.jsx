/**
 * CameraPanel — Main video feed panel for LiveMonitoring.
 *
 * @param {Object} props
 * @param {boolean}  props.isStreaming  - Whether the stream is live.
 * @param {{ shop, line, stage }} props.config - Active configuration.
 */
const CameraPanel = ({ isStreaming, config }) => (
  <div className="relative flex flex-col w-4/5 overflow-hidden bg-black border border-gray-800 shadow-lg rounded-2xl">
    {/* Overlay header */}
    <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
      <div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="font-mono text-sm tracking-wider text-white uppercase">
            {isStreaming ? 'LIVE FEED' : 'OFFLINE'}
          </span>
        </div>
        {isStreaming && (
          <div className="mt-1 font-mono text-xs text-gray-300">
            CAM_04 | {config.shop} &gt; {config.line} &gt; {config.stage}
          </div>
        )}
      </div>
      <div className="font-mono text-sm text-white/80">
        {new Date().toLocaleTimeString()}
      </div>
    </div>

    {/* Feed area */}
    <div className="flex items-center justify-center flex-1 bg-gray-900">
      {isStreaming ? (
        <div className="relative w-full h-full">
          <img
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=2000&q=80"
            className="object-cover w-full h-full opacity-80"
            alt="Live Camera Feed"
          />
          {/* Example bounding box overlay */}
          <div className="absolute w-64 border-4 border-green-500 rounded-lg top-1/4 left-1/3 h-96">
            <div className="absolute top-0 left-0 px-2 py-1 text-xs font-bold text-white transform -translate-y-full bg-green-500 rounded-t">
              Worker #429 (98%)
            </div>
            <div className="absolute flex flex-col gap-1 left-2 bottom-2">
              {[
                { label: 'Helmet', color: 'bg-red-500' },
                { label: 'Gloves', color: 'bg-blue-500' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1 px-2 py-1 rounded bg-black/60">
                  <div className={`w-2 h-2 ${color} rounded-full`} />
                  <span className="text-xs text-white">{label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Scanline grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '100px 100px',
            }}
          />
        </div>
      ) : (
        <div className="text-center">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 text-gray-600 bg-gray-800 rounded-full">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-400">Camera Feed Offline</h3>
          <p className="max-w-xs mx-auto mt-2 text-sm text-gray-500">
            Select a Shop, Line, and Stage from the configuration panel to start the stream.
          </p>
        </div>
      )}
    </div>
  </div>
);

export default CameraPanel;
