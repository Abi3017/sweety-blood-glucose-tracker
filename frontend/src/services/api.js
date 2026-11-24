import axios from 'axios';

export const UNAUTHORIZED_EVENT = 'sweety:unauthorized';

/**
 * Shared Axios instance. Auth uses an HttpOnly cookie, so no token is ever
 * handled in JavaScript; `withCredentials` lets the browser send it, and the
 * X-Requested-With header satisfies the API's CSRF check.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
});

/** Turns any Axios error into { status, code, message, details } with a readable message. */
export function normalizeError(error) {
  if (error?.response) {
    const { status, data } = error.response;
    const apiError = data?.error || {};
    return {
      status,
      code: apiError.code || 'ERROR',
      message:
        apiError.message ||
        (status >= 500 ? 'Something went wrong on our side. Please try again later.' : 'The request could not be completed.'),
      details: apiError.details || [],
    };
  }
  if (error?.code === 'ECONNABORTED') {
    return { status: 0, code: 'TIMEOUT', message: 'The server took too long to respond. Please try again.', details: [] };
  }
  return {
    status: 0,
    code: 'NETWORK_ERROR',
    message: 'Unable to reach the server. Please check your connection and try again.',
    details: [],
  };
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = normalizeError(error);
    // An expired/invalid session on any private call signs the user out.
    if (normalized.status === 401 && ['TOKEN_EXPIRED', 'INVALID_TOKEN', 'UNAUTHORIZED'].includes(normalized.code)) {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT, { detail: normalized }));
    }
    return Promise.reject(normalized);
  },
);

export default api;
