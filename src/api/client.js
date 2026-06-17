/**
 * Low-level HTTP client for the PPE Detection backend.
 *
 * Responsibilities:
 *  - build URLs (base + path + query string),
 *  - normalise failures into a single `ApiError` type (network, HTTP, envelope),
 *  - transparently unwrap the `{ success, message, data }` response envelope used
 *    by the `/api/v1/*` endpoints while leaving legacy raw responses untouched.
 */
import { API_BASE_URL } from './config';

/** A single, predictable error type for every API failure. */
export class ApiError extends Error {
  constructor(message, { code = 'UNKNOWN', status = 0, details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  /** Network failures usually mean the backend isn't running / reachable. */
  get isNetwork() {
    return this.code === 'NETWORK_ERROR';
  }
}

/** Serialise a params object into a query string, skipping empty values. */
const buildQuery = (params) => {
  if (!params) return '';
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      usp.append(key, String(value));
    }
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
};

/**
 * Perform a request against the backend.
 *
 * @param {string} path                  - Path beginning with "/".
 * @param {Object} [opts]
 * @param {Object} [opts.params]         - Query params (empty values dropped).
 * @param {AbortSignal} [opts.signal]    - Abort signal for cancellation.
 * @param {string} [opts.method='GET']
 * @param {boolean} [opts.envelope=true] - Unwrap the `{success,data}` envelope.
 * @param {boolean} [opts.raw=false]     - Return the raw `Response` (for text/SSE).
 * @returns {Promise<any>} parsed body, or the full envelope for list endpoints
 *                          (so callers can read `pagination`), or `Response` when raw.
 */
export async function request(
  path,
  { params, signal, method = 'GET', envelope = true, raw = false } = {},
) {
  const url = `${API_BASE_URL}${path}${buildQuery(params)}`;

  let response;
  try {
    response = await fetch(url, {
      method,
      signal,
      headers: raw ? undefined : { Accept: 'application/json' },
    });
  } catch (err) {
    // Re-throw aborts untouched so callers can ignore them.
    if (err?.name === 'AbortError') throw err;
    throw new ApiError(
      'Cannot reach the detection server. Make sure the backend is running.',
      { code: 'NETWORK_ERROR', details: err?.message },
    );
  }

  if (raw) {
    if (!response.ok) {
      throw new ApiError(`Request failed (HTTP ${response.status})`, {
        code: 'HTTP_ERROR',
        status: response.status,
      });
    }
    return response;
  }

  // Parse the body once; tolerate empty or non-JSON payloads.
  let body = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message =
      body?.message ||
      body?.error?.message ||
      (typeof body?.error === 'string' ? body.error : null) ||
      `Request failed with status ${response.status}`;
    const code =
      body?.error?.code || (response.status === 404 ? 'NOT_FOUND' : 'HTTP_ERROR');
    throw new ApiError(message, { code, status: response.status, details: body });
  }

  // `/api/v1/*` envelope handling.
  if (envelope && body && typeof body === 'object' && 'success' in body) {
    if (!body.success) {
      throw new ApiError(body.message || 'Request was not successful', {
        code: body.error?.code || 'API_ERROR',
        status: response.status,
        details: body,
      });
    }
    return body; // { success, message, data, pagination? }
  }

  return body; // legacy raw shape
}
