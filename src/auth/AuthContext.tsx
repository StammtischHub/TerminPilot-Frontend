import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, ApiError, type UserResponse } from '../api/client';

type AuthContextValue = {
  user: UserResponse | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // App-Start: Session prüfen. Nebeneffekt: Server setzt das XSRF-TOKEN-Cookie.
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
    if (!data) throw new ApiError(response.status);
    setUser(data);
  };

  const register = async (username: string, password: string) => {
    const { data, response } = await api.POST('/api/auth/register', {
      body: { username, password },
    });
    if (!data) throw new ApiError(response.status);
    await login(username, password);
  };

  const logout = async () => {
    try {
      await api.POST('/api/auth/logout');
    } finally {
      setUser(null);
      // Server hat das CSRF-Cookie beim Logout gelöscht (Rotation):
      // stiller /me-Call holt ein frisches Token; 401 ist hier erwartet.
      void api.GET('/api/auth/me');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden');
  return ctx;
}
