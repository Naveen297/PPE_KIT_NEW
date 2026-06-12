import { useState, useEffect, useCallback, useRef } from 'react';
import { getCameras } from '@/api';
import { POLL_INTERVAL_MS } from '@/api/config';

/**
 * Polls `GET /cameras` for the configured cameras and their live/offline status.
 *
 * @param {Object} [options]
 * @param {number} [options.pollMs]   Poll interval (0 disables polling).
 * @param {boolean} [options.enabled] Pause polling while false.
 * @returns {{ cameras, error, loading, refetch }}
 */
export default function useCameras({ pollMs = POLL_INTERVAL_MS, enabled = true } = {}) {
  const [state, setState] = useState({ cameras: [], error: null, loading: enabled });
  const mountedRef = useRef(true);

  const load = useCallback(
    async (signal, { silent = false } = {}) => {
      if (!silent) setState((s) => ({ ...s, loading: true }));
      try {
        const res = await getCameras(signal);
        if (!mountedRef.current) return;
        setState({ cameras: res?.cameras ?? [], error: null, loading: false });
      } catch (err) {
        if (!mountedRef.current || err?.name === 'AbortError') return;
        setState((s) => ({ ...s, error: err, loading: false }));
      }
    },
    [],
  );

  useEffect(() => {
    mountedRef.current = true;
    if (!enabled) return undefined;

    const controller = new AbortController();
    load(controller.signal);

    let timer;
    if (pollMs > 0) {
      timer = setInterval(() => load(controller.signal, { silent: true }), pollMs);
    }

    return () => {
      mountedRef.current = false;
      controller.abort();
      if (timer) clearInterval(timer);
    };
  }, [enabled, pollMs, load]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    load(controller.signal);
  }, [load]);

  return { ...state, refetch };
}
