import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authService from '../services/authService';

const C = createContext();

/**
 * AuthProvider — JWT-backed authentication context.
 *
 * Exposed surface (identical to the old LocalStorage version so all consumers
 * keep working without changes):
 *   user        { id, name, email, currency, theme }  |  null
 *   loading     boolean — true while the initial /me check is in flight
 *   signup({ name, email, password })   → throws on error
 *   login({ email, password })          → throws on error
 *   logout()
 *   deleteAccount()                     → throws on error
 *   updateProfile(data)                 → throws on error, refreshes user
 *   changePassword(data)                → throws on error
 */
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true until we know if a session exists

  // ── On mount: restore session from existing JWT ──────────────────────────
  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    // Verify the token is still valid by fetching the profile
    authService.getMe()
      .then(({ user: u }) => setUser(u))
      .catch(() => {
        // Token expired or invalid — clear it silently
        authService.clearToken();
      })
      .finally(() => setLoading(false));
  }, []);

  // ── signup ────────────────────────────────────────────────────────────────
  const signup = useCallback(async ({ name, email, password }) => {
    // Throws on network/validation error (caught by Signup.jsx)
    const { user: u } = await authService.register({ name, email, password });
    setUser(u);
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    const { user: u } = await authService.login({ email, password });
    setUser(u);
  }, []);

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  // ── deleteAccount ─────────────────────────────────────────────────────────
  const deleteAccount = useCallback(async () => {
    await authService.deleteAccount();
    setUser(null);
  }, []);

  // ── updateProfile ─────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (data) => {
    const { user: u } = await authService.updateProfile(data);
    setUser(u);
    return u;
  }, []);

  // ── changePassword ────────────────────────────────────────────────────────
  const changePassword = useCallback(async (data) => {
    await authService.changePassword(data);
  }, []);

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    deleteAccount,
    updateProfile,
    changePassword,
  };

  return <C.Provider value={value}>{children}</C.Provider>;
}

export const useAuth = () => useContext(C);
