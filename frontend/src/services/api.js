/**
 * Configured Axios instance.
 *
 * Every request to /api/* automatically:
 *   - Uses the correct base URL (proxied in dev, env var in prod)
 *   - Attaches the JWT Bearer token from localStorage if present
 *   - Extracts response.data so callers receive the payload directly
 *   - Redirects to /login on 401 (expired / missing token)
 */

import axios from 'axios';

const TOKEN_KEY = 'expenseflow_token';

const api = axios.create({
  // In development Vite proxies /api → http://localhost:5000.
  // In production set VITE_API_URL to the deployed backend origin.
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor: attach token ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: unwrap data + handle 401 ───────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Network error';

    // Token expired / invalidated — force logout
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // Only redirect if we're not already on an auth page
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/signup')) {
        window.location.href = '/login';
      }
    }

    // Return a normalised error so every caller can just catch(err => err.message)
    return Promise.reject(new Error(message));
  }
);

export const TOKEN_STORAGE_KEY = TOKEN_KEY;
export default api;
