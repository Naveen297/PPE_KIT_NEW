import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Generic data-fetching hook with cancellation + manual refetch.
 *
 * The `fetcher` receives an AbortSignal and should return a promise. It is held
 * in a ref so an inline arrow (recreated every render) doesn't re-trigger the
 * effect — control re-fetching through `deps` instead.
 *
 * @param {(signal: AbortSignal) => Promise<any>} fetcher
 * @param {Array} [deps=[]]                Re-fetch when any of these change.
 * @param {Object} [options]
 * @param {boolean} [options.enabled=true] Skip fetching while false.
 * @returns {{ data, error, loading, refetch }}
 */
export default function useApiResource(fetcher, deps = [], { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: enabled });
  const [reloadTick, setReloadTick] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, error: null, loading: false });
      return undefined;
    }

    const controller = new AbortController();
    let active = true;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    Promise.resolve(fetcherRef.current(controller.signal))
      .then((data) => {
        if (active) setState({ data, error: null, loading: false });
      })
      .catch((err) => {
        if (!active || controller.signal.aborted || err?.name === 'AbortError') return;
        setState({ data: null, error: err, loading: false });
      });

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadTick, enabled]);

  const refetch = useCallback(() => setReloadTick((t) => t + 1), []);

  return { ...state, refetch };
}
