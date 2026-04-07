import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  phone_verified?: boolean;
  role: 'client' | 'artisan' | 'admin';
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'client' | 'artisan';
  phone?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // --- MOCK ACCOUNTS (remove when backend is live) ---
    const mocks: Record<string, User> = {
      'client@test.com':  { id: 'mock-client-1',  name: 'Marie Ouédraogo',  email: 'client@test.com',  role: 'client' },
      'artisan@test.com': { id: 'mock-artisan-1', name: 'Konan Électricité', email: 'artisan@test.com', role: 'artisan' },
      'admin@test.com':   { id: 'mock-admin-1',   name: 'Admin Plateforme',  email: 'admin@test.com',   role: 'admin' },
    };
    if (password === 'password123' && mocks[email]) {
      const mockUser = mocks[email];
      localStorage.setItem('accessToken', 'mock-access-token');
      localStorage.setItem('refreshToken', 'mock-refresh-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      return;
    }
    // ---------------------------------------------------
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (payload: RegisterData) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
