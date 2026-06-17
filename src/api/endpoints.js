/**
 * Typed wrappers around every backend endpoint documented in
 * `src/API_DETAILS.txt`. Components and hooks should call these rather than
 * touching `request` / URLs directly.
 *
 * Each `data`-returning function resolves to the already-unwrapped payload.
 * List endpoints (e.g. detections) resolve to the full envelope so callers can
 * also read `pagination`.
 */
import { request } from './client';
import { API_BASE_URL, WS_BASE_URL } from './config';

/* ───────────────────────── A. Health & operations ───────────────────────── */

/** A1 — plain-text health check ("Flask app is running."). */
export const getHealth = (signal) =>
  request('/', { signal, raw: true }).then((r) => r.text());

/** A2 — configured cameras and their live/offline status. */
export const getCameras = (signal) =>
  request('/cameras', { signal, envelope: false });

/** A3 — manually (idempotently) start the detection engine. */
export const startBackend = (signal) =>
  request('/start_backend', { signal, raw: true }).then((r) => r.text());

/**
 * A4 — current server date/time, used for the header "last updated" stamp.
 * Returns the raw body (string or object) so callers can normalise whatever
 * shape the backend sends; transparently unwraps the `{success,data}` envelope.
 */
export const getDateTime = (signal) => request('/datetime', { signal });

/* ─────────────────────────────── B. Dashboard ───────────────────────────── */

/**
 * B1 — KPI cards + PPE breakdown.
 * period: daily|weekly|monthly|custom. When period is 'custom', pass
 * startDate/endDate (YYYY-MM-DD); empty values are dropped by the client.
 */
export const getDashboardStats = (
  period = 'daily',
  { startDate, endDate } = {},
  signal,
) =>
  request('/api/v1/dashboard/stats', {
    params: { period, startDate, endDate },
    signal,
  }).then((r) => r.data);

/** B2 — violation counts bucketed over time. */
export const getIncidentsOverTime = (
  { viewMode = 'weekly', startDate, endDate } = {},
  signal,
) =>
  request('/api/v1/dashboard/charts/incidents-over-time', {
    params: { viewMode, startDate, endDate },
    signal,
  }).then((r) => r.data);

/** B3 — violation counts per work zone (top 6). */
export const getAreaWise = (period = 'monthly', signal) =>
  request('/api/v1/dashboard/charts/area-wise', {
    params: { period },
    signal,
  }).then((r) => r.data);

/** B4 — risk distribution (High / Medium / Under Control). */
export const getRiskLevel = (period = 'monthly', signal) =>
  request('/api/v1/dashboard/charts/risk-level', {
    params: { period },
    signal,
  }).then((r) => r.data);

/** B5 — camera online/offline uptime snapshot. */
export const getCameraUptime = (period = 'monthly', signal) =>
  request('/api/v1/dashboard/charts/camera-uptime', {
    params: { period },
    signal,
  }).then((r) => r.data);

/** B6 — counts by missing PPE item type (top 6). */
export const getIncidentType = (period = 'monthly', signal) =>
  request('/api/v1/dashboard/charts/incident-type', {
    params: { period },
    signal,
  }).then((r) => r.data);

/* ─────────────────────────────── C. Detections ──────────────────────────── */

/**
 * C1 — paginated detections table. Returns the FULL envelope so callers can
 * read `pagination` alongside `data`.
 * params: { status, page, limit, sortBy, sortOrder }
 */
export const getDetections = (params = {}, signal) =>
  request('/api/v1/detections', { params, signal });

/** C2 — single detection detail (includes base64 image data URI). */
export const getDetection = (id, signal) =>
  request(`/api/v1/detections/${id}`, { signal }).then((r) => r.data);

/** C3 — SSE URL for the live "new-detection" stream (open with EventSource). */
export const detectionStreamUrl = () => `${API_BASE_URL}/api/v1/detections/stream`;

/* ───────────────────────────── D. Live video (WS) ───────────────────────── */

/** D1 — WebSocket URL for one camera's annotated JPEG frames. */
export const videoSocketUrl = (cameraName) =>
  `${WS_BASE_URL}/ws/video/${encodeURIComponent(cameraName)}`;

/* ─────────────────────────────── E. Legacy ──────────────────────────────── */

/** E1 — SSE URL for today's raw violation rows (default "message" event). */
export const reportsStreamUrl = () => `${API_BASE_URL}/stream_reports`;

/** E2 — paginated/filtered report rows (raw, no envelope). */
export const getCombinedReport = (params = {}, signal) =>
  request('/get_combined_report', { params, signal, envelope: false });

/** E3 — per-camera violation counts in a date range (raw array). */
export const getDetectionCounts = (params = {}, signal) =>
  request('/get_detection_counts', { params, signal, envelope: false });

/** E4 — per-camera violation counts + last update. */
export const getDetectionCounters = (params = {}, signal) =>
  request('/get_detection_counters', { params, signal, envelope: false });
