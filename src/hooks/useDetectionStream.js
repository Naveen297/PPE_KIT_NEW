import { useEffect, useRef, useState } from 'react';
import { detectionStreamUrl } from '@/api';

/**
 * Subscribes to the live "new-detection" SSE feed and invokes `onDetection`
 * with each parsed detection object. The callback is held in a ref so the
 * EventSource isn't torn down on every render.
 *
 * @param {(detection: object) => void} onDetection
 * @param {Object} [options]
 * @param {boolean} [options.enabled=true]
 * @returns {{ connected: boolean }}
 */
export default function useDetectionStream(onDetection, { enabled = true } = {}) {
  const callbackRef = useRef(onDetection);
  callbackRef.current = onDetection;

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled || typeof EventSource === 'undefined') return undefined;

    let source;
    try {
      source = new EventSource(detectionStreamUrl());
    } catch {
      return undefined;
    }

    const handleMessage = (event) => {
      try {
        callbackRef.current?.(JSON.parse(event.data));
      } catch {
        /* ignore malformed frames */
      }
    };

    source.addEventListener('new-detection', handleMessage);
    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false); // EventSource auto-reconnects

    return () => {
      source.removeEventListener('new-detection', handleMessage);
      source.close();
      setConnected(false);
    };
  }, [enabled]);

  return { connected };
}
