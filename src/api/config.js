/**
 * API configuration — base URLs for REST/SSE and WebSocket traffic.
 *
 * Override per-environment via a `.env` file (see `.env.example`):
 *   VITE_API_BASE_URL=http://127.0.0.1:5000
 *   VITE_WS_BASE_URL=ws://127.0.0.1:5000   (optional; derived from the API URL)
 */

const stripTrailingSlash = (url) => (url ? url.replace(/\/+$/, '') : url);

/** REST + SSE base, e.g. "http://127.0.0.1:5000". */
export const API_BASE_URL = stripTrailingSlash(
  import.meta.env?.VITE_API_BASE_URL || 'http://127.0.0.1:5000',
);

/**
 * WebSocket base, e.g. "ws://127.0.0.1:5000". Falls back to the API base with
 * the http(s) scheme swapped for ws(s) so a single env var is usually enough.
 */
export const WS_BASE_URL = stripTrailingSlash(
  import.meta.env?.VITE_WS_BASE_URL || API_BASE_URL.replace(/^http/i, 'ws'),
);

/** How often live "snapshot" resources (e.g. camera status) are re-polled. */
export const POLL_INTERVAL_MS = Number(
  import.meta.env?.VITE_POLL_INTERVAL_MS || 15000,
);
