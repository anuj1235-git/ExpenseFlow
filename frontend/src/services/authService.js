/**
 * Auth API service
 * Wraps all /api/auth endpoints.
 * Token storage/removal is handled here so AuthContext stays thin.
 */

import api, { TOKEN_STORAGE_KEY } from './api';

// ── Token helpers ─────────────────────────────────────────────────────────────
export const saveToken  = (token) => localStorage.setItem(TOKEN_STORAGE_KEY, token);
export const clearToken = ()      => localStorage.removeItem(TOKEN_STORAGE_KEY);
export const getToken   = ()      => localStorage.getItem(TOKEN_STORAGE_KEY);

// ── Endpoints ─────────────────────────────────────────────────────────────────

/**
 * Register a new account.
 * @param {{ name: string, email: string, password: string }} data
 * @returns {{ token: string, user: object }}
 */
export async function register(data) {
  const res = await api.post('/auth/register', data);
  saveToken(res.data.token);
  return res.data; // { token, user }
}

/**
 * Login with email + password.
 * @param {{ email: string, password: string }} data
 * @returns {{ token: string, user: object }}
 */
export async function login(data) {
  const res = await api.post('/auth/login', data);
  saveToken(res.data.token);
  return res.data; // { token, user }
}

/**
 * Fetch the current user's profile (requires valid token).
 * @returns {{ user: object }}
 */
export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data; // { user }
}

/**
 * Update name, email, currency or theme.
 * @param {{ name?, email?, currency?, theme? }} data
 * @returns {{ token: string, user: object }}
 */
export async function updateProfile(data) {
  const res = await api.put('/auth/profile', data);
  // The backend issues a fresh token when email changes
  if (res.data.token) saveToken(res.data.token);
  return res.data;
}

/**
 * Change the user's password.
 * @param {{ currentPassword: string, newPassword: string, confirmPassword: string }} data
 */
export async function changePassword(data) {
  const res = await api.put('/auth/change-password', data);
  return res; // { success, message }
}

/**
 * Permanently delete the account and all associated data.
 */
export async function deleteAccount() {
  const res = await api.delete('/auth/account');
  clearToken();
  return res;
}

/** Remove the token (client-side logout — no server call needed for JWT). */
export function logout() {
  clearToken();
}
