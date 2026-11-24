import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import { UNAUTHORIZED_EVENT } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [sessionMessage, setSessionMessage] = useState('');

  // Restore the session from the HttpOnly cookie on page load.
  useEffect(() => {
    let active = true;
    authService
      .getCurrentUser()
      .then((current) => active && setUser(current))
      .catch(() => active && setUser(null))
      .finally(() => active && setInitializing(false));
    return () => {
      active = false;
    };
  }, []);

  // Any 401 from the API (expired/invalid token) clears the client session.
  useEffect(() => {
    const handler = (event) => {
      setUser((current) => {
        if (current && event.detail?.code === 'TOKEN_EXPIRED') setSessionMessage(event.detail.message);
        return null;
      });
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handler);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
  }, []);

  const login = useCallback(async (credentials) => {
    const loggedIn = await authService.login(credentials);
    setSessionMessage('');
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const register = useCallback(async (payload) => {
    const created = await authService.register(payload);
    setSessionMessage('');
    setUser(created);
    return created;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initializing,
      sessionMessage,
      clearSessionMessage: () => setSessionMessage(''),
      login,
      register,
      logout,
    }),
    [user, initializing, sessionMessage, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
