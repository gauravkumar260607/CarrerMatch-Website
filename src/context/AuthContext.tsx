import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { api, setStoredToken, removeStoredToken, getStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  unreadCount: number;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; role: string; companyName?: string }) => Promise<void>;
  logout: () => void;
  switchDemoAccount: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const refreshNotifications = useCallback(async () => {
    if (!getStoredToken()) {
      setUnreadCount(0);
      return;
    }
    try {
      const data = await api.getNotifications();
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Ignore background notification fetch errors
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { user: fetchedUser } = await api.getMe();
      setUser(fetchedUser);
      await refreshNotifications();
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      removeStoredToken();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [refreshNotifications]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password });
    setStoredToken(data.token);
    setToken(data.token);
    setUser(data.user);
    await refreshNotifications();
  };

  const register = async (payload: { name: string; email: string; password: string; role: string; companyName?: string }) => {
    const data = await api.register(payload);
    setStoredToken(data.token);
    setToken(data.token);
    setUser(data.user);
    await refreshNotifications();
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
    setUnreadCount(0);
  };

  const switchDemoAccount = async (role: UserRole) => {
    setLoading(true);
    try {
      let email = 'seeker@careermatch.io';
      if (role === 'recruiter') email = 'recruiter@careermatch.io';
      if (role === 'admin') email = 'admin@careermatch.io';

      await login(email, 'password123');
    } catch (err) {
      console.error('Failed to switch demo account:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        unreadCount,
        login,
        register,
        logout,
        switchDemoAccount,
        refreshUser,
        refreshNotifications
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
