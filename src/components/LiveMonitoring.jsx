import { useState } from 'react';
import { usePlant } from '../context/PlantContext';

const LiveMonitoring = () => {
  const { currentPlant } = usePlant();
  const [isStreaming, setIsStreaming] = useState(false);
  const [config, setConfig] = useState({
    shop: '',
    line: '',
    stage: ''
  });

  const shops = ['Body Shop', 'Paint Shop', 'General Assembly', 'Press Shop'];
  const lines = ['Line A', 'Line B', 'Line C', 'Line Main'];
  const stages = ['Stage 10', 'Stage 20', 'Stage 30', 'Quality Gate', 'Final Finish'];

  const handleStartStream = () => {
    if (config.shop && config.line && config.stage) {
      setIsStreaming(true);
    } else {
      alert("Please select Shop, Line, and Stage details first.");
    }
  };

  const handleStopStream = () => {
    setIsStreaming(false);
  };

  const indicators = [
    { label: 'Helmet', color: 'bg-red-500' },
    { label: 'Gloves', color: 'bg-blue-500' },
    { label: 'Apron', color: 'bg-yellow-500' },
    { label: 'Mobile', color: 'bg-purple-500' },
    { label: 'Shoes', color: 'bg-green-500' },
    { label: 'Goggles', color: 'bg-orange-500' }
  ];

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 mt-6 animate-fade-in">
      <div className="flex flex-col w-1/5 overflow-hidden bg-white border border-gray-200 shadow-md rounded-2xl">
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="flex items-center gap-2 font-bold text-gray-800">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Camera Config
          </h3>
          <p className="mt-1 text-xs text-gray-500">{currentPlant.name}</p>
        </div>

        <div className="flex-1 p-5 space-y-5 overflow-y-auto">
          <div>
            <label className="block mb-2 text-xs font-bold text-gray-600 uppercase">Select Shop</label>
            <select
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={config.shop}
              onChange={(e) => setConfig({...config, shop: e.target.value})}
              disabled={isStreaming}
            >
              <option value="">-- Select Shop --</option>
              {shops.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-xs font-bold text-gray-600 uppercase">Select Line</label>
            <select
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={config.line}
              onChange={(e) => setConfig({...config, line: e.target.value})}
              disabled={isStreaming}
            >
              <option value="">-- Select Line --</option>
              {lines.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-xs font-bold text-gray-600 uppercase">Select Stage</label>
            <select
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={config.stage}
              onChange={(e) => setConfig({...config, stage: e.target.value})}
              disabled={isStreaming}
            >
              <option value="">-- Select Stage --</option>
              {stages.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="pt-4 mt-2 border-t border-gray-100">
            <label className="block mb-3 text-xs font-bold text-gray-600 uppercase">Detection Indicators</label>
            <div className="grid grid-cols-2 gap-2">
              {indicators.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${item.color} shadow-sm`}></span>
                  <span className="text-xs font-medium text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-200 bg-gray-50">
          {!isStreaming ? (
            <button
              onClick={handleStartStream}
              className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition-all bg-blue-600 shadow-md hover:bg-blue-700 rounded-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Stream
            </button>
          ) : (
            <button
              onClick={handleStopStream}
              className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition-all bg-red-500 shadow-md hover:bg-red-600 rounded-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Stop Stream
            </button>
          )}
        </div>
      </div>

      <div className="relative flex flex-col w-4/5 overflow-hidden bg-black border border-gray-800 shadow-lg rounded-2xl">
        <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
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

        <div className="flex items-center justify-center flex-1 bg-gray-900">
          {isStreaming ? (
            <div className="relative w-full h-full">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=2000&q=80"
                className="object-cover w-full h-full opacity-80"
                alt="Live Camera Feed"
              />

              <div className="absolute w-64 border-4 border-green-500 rounded-lg top-1/4 left-1/3 h-96">
                <div className="absolute top-0 left-0 px-2 py-1 text-xs font-bold text-white transform -translate-y-full bg-green-500 rounded-t">
                  Worker #429 (98%)
                </div>
                <div className="absolute flex flex-col gap-1 left-2 bottom-2">
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-black/60">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-white">Helmet</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-black/60">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-white">Gloves</span>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px'}}>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 text-gray-600 bg-gray-800 rounded-full">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-400">Camera Feed Offline</h3>
              <p className="max-w-xs mx-auto mt-2 text-sm text-gray-500">Select a Shop, Line, and Stage from the configuration panel on the left to start the stream.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoring;
