import { useEffect, useState } from 'react';
import { videoSocketUrl } from '@/api';

/**
 * Streams one camera's annotated JPEG frames over WebSocket and exposes the
 * latest frame as an object URL. Object URLs are revoked as new frames arrive
 * and on teardown to avoid memory leaks.
 *
 * status: 'idle' | 'connecting' | 'waiting' | 'live' | 'error'
 *  - 'waiting' = socket open but the camera hasn't pushed a frame yet
 *    (a camera with no live feed simply sends nothing — see API notes).
 *
 * @param {string} cameraName
 * @param {boolean} enabled
 * @returns {{ frameUrl: string|null, status: string }}
 */
export default function useVideoStream(cameraName, enabled) {
  const [frameUrl, setFrameUrl] = useState(null);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!enabled || !cameraName || typeof WebSocket === 'undefined') {
      setStatus('idle');
      setFrameUrl(null);
      return undefined;
    }

    let socket;
    let currentUrl = null;
    let closed = false;

    setStatus('connecting');

    try {
      socket = new WebSocket(videoSocketUrl(cameraName));
      socket.binaryType = 'blob';
    } catch {
      setStatus('error');
      return undefined;
    }

    socket.onopen = () => {
      if (!closed) setStatus('waiting');
    };

    socket.onmessage = (event) => {
      if (closed || !(event.data instanceof Blob)) return;
      const url = URL.createObjectURL(event.data);
      setFrameUrl(url);
      setStatus('live');
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      currentUrl = url;
    };

    socket.onerror = () => {
      if (!closed) setStatus('error');
    };

    socket.onclose = () => {
      if (!closed) setStatus('error');
    };

    return () => {
      closed = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      try {
        socket.close();
      } catch {
        /* already closing */
      }
      setFrameUrl(null);
      setStatus('idle');
    };
  }, [cameraName, enabled]);

  return { frameUrl, status };
}
