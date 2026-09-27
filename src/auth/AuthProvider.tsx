import { useEffect, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import { AuthContext } from './AuthContext';
import type { Schema } from '../api/types.ts';

type UserResponse = Schema<'UserResponse'>;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    api
      .GET('/api/auth/me', { signal: controller.signal })
      .then(({ data }) => setUser(data ?? null))
      .catch(() => {
        if (!controller.signal.aborted) setUser(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
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
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser: setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
