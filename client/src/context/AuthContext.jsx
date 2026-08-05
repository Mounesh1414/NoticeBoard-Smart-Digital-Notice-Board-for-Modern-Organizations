import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest, clearSession, getStoredUser, setSession } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => localStorage.getItem('noticeboard_token'));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let mounted = true;

    async function loadMe() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest('/api/auth/me');
        if (mounted) {
          setUser(response.user);
        }
      } catch {
        clearSession();
        if (mounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMe();
    return () => {
      mounted = false;
    };
  }, [token]);

  async function login(credentials) {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    setSession(response.token, response.user);
    setToken(response.token);
    setUser(response.user);
  }

  async function register(credentials) {
    const response = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    setSession(response.token, response.user);
    setToken(response.token);
    setUser(response.user);
  }

  function logout() {
    clearSession();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, setUser }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
