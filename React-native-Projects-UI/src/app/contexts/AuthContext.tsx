// src/app/contexts/AuthContext.tsx
// Real API auth — replaces mock.
// Stores accessToken + refreshToken in localStorage.
// User object is decoded from JWT on login and persisted.

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, tokens } from '../../lib/api';

export type UserRole = 'PLANNER' | 'VENDOR' | 'CLIENT' | 'ADMIN';

export interface User {
  id:           string;
  firstName:    string;
  lastName:     string;
  email:        string;
  role:         UserRole;
  vendorId:     string | null;
  plannerId:    string | null;
  // Vendor-specific (populated for VENDOR role)
  businessName?: string;
  category?:    string;
  phone?:       string;
}

interface AuthContextType {
  user:            User | null;
  isAuthenticated: boolean;
  login:           (email: string, password: string) => Promise<void>;
  register:        (data: RegisterData) => Promise<void>;
  logout:          () => void;
  loading:         boolean;
}

interface RegisterData {
  firstName:     string;
  lastName:      string;
  email:         string;
  password:      string;
  role:          UserRole;
  businessName?: string;
  category?:     string;
  phone?:        string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const USER_KEY = 'ef_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (stored && tokens.getAccess()) {
      try { setUser(JSON.parse(stored)); } catch { /* corrupt — ignore */ }
    }
    setLoading(false);
  }, []);

  const persist = (u: User, accessToken: string, refreshToken: string) => {
    tokens.setAccess(accessToken);
    tokens.setRefresh(refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    const data = await auth.login(email, password);
    persist(data.user as User, data.accessToken, data.refreshToken);
  };

  const register = async (formData: RegisterData) => {
    const data = await auth.register(formData);
    persist(data.user as User, data.accessToken, data.refreshToken);
  };

  const logout = () => {
    tokens.clear();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
