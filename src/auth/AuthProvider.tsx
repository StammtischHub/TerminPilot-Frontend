import { useEffect, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import { AuthContext } from './AuthContext';
import type { Schema } from '../api/types.ts';

type UserResponse = Schema<'UserResponse'>;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .GET('/api/auth/me')
      .then(({ data }) => setUser(data ?? null))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  const login = async (username: string, password: string) => {
    const { data, response } = await api.POST('/api/auth/login', {
      body: { username, password },
    });
    if (data && response.ok) setUser(data);
    return response;
  };

  const register = async (username: string, password: string) => {
    const { data, response } = await api.POST('/api/auth/register', {
      body: { username, password },
    });
    if (data && response.ok) await login(username, password);
    return response;
  };

  const logout = async () => {
    try {
      await api.POST('/api/auth/logout');
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
