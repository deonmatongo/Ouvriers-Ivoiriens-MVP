import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../lib/api';

export interface User {
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
  logout: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'client' | 'artisan';
  phone?: string;
}

const MOCK_USERS: Record<string, User> = {
  'client@test.com':  { id: 'mock-client-1',  name: 'Marie Ouédraogo', email: 'client@test.com',  role: 'client' },
  'artisan@test.com': { id: 'mock-artisan-1', name: 'Konan Électricité', email: 'artisan@test.com', role: 'artisan' },
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync('user').then((stored) => {
      if (stored) setUser(JSON.parse(stored));
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    // Mock bypass
    if (password === 'password123' && MOCK_USERS[email]) {
      const mockUser = MOCK_USERS[email];
      await SecureStore.setItemAsync('accessToken', 'mock-access-token');
      await SecureStore.setItemAsync('refreshToken', 'mock-refresh-token');
      await SecureStore.setItemAsync('user', JSON.stringify(mockUser));
      setUser(mockUser);
      return;
    }
    const { data } = await api.post('/auth/login', { email, password });
    await SecureStore.setItemAsync('accessToken', data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
    await SecureStore.setItemAsync('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (payload: RegisterData) => {
    const { data } = await api.post('/auth/register', payload);
    await SecureStore.setItemAsync('accessToken', data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
    await SecureStore.setItemAsync('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
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
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
