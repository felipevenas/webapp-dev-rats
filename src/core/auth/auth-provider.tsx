import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, onUnauthorized, refreshSession, tokenStore } from '@/core/http/api-client';
import type { AuthResponse, User } from '@/core/types/api';
import { buildLoginPayload } from '@/features/auth/domain/login-payload';

type AuthStatus = 'booting' | 'authenticated' | 'anonymous';

interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
  username: string;
  timezone: string;
  acceptedTermsVersion: string;
}

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  login: (identifier: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

let bootstrapPromise: Promise<User | null> | null = null;

async function bootstrapSession(): Promise<User | null> {
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    const token = await refreshSession();
    if (!token) return null;
    try {
      const response = await api.get<User>('/me');
      return response.data;
    } catch {
      tokenStore.clear();
      return null;
    } finally {
      bootstrapPromise = null;
    }
  })();
  return bootstrapPromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUserState] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('booting');

  useEffect(() => {
    let active = true;
    const unsubscribe = onUnauthorized(() => {
      if (!active) return;
      tokenStore.clear();
      setUserState(null);
      setStatus('anonymous');
      queryClient.clear();
    });

    bootstrapSession().then((sessionUser) => {
      if (!active) return;
      setUserState(sessionUser);
      setStatus(sessionUser ? 'authenticated' : 'anonymous');
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [queryClient]);

  const applySession = useCallback(
    (response: AuthResponse) => {
      tokenStore.set(response.accessToken);
      setUserState(response.user);
      setStatus('authenticated');
      queryClient.clear();
      return response.user;
    },
    [queryClient],
  );

  const login = useCallback(
    async (identifier: string, password: string) => {
      //---- Deploy transitório: a API antiga só aceita e-mail. O helper mantém os dois contratos.
      const payload = buildLoginPayload(identifier, password);
      const response = await api.post<AuthResponse>('/auth/login', payload);
      return applySession(response.data);
    },
    [applySession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await api.post<AuthResponse>('/auth/register', payload);
      return applySession(response.data);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      //---- Logout must always clear the local session, even when the API is unreachable.
    } finally {
      tokenStore.clear();
      setUserState(null);
      setStatus('anonymous');
      queryClient.clear();
    }
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get<User>('/me');
      setUserState(response.data);
      return response.data;
    } catch {
      return null;
    }
  }, []);

  const setUser = useCallback((nextUser: User) => setUserState(nextUser), []);

  const value = useMemo(
    () => ({ user, status, login, register, logout, setUser, refreshUser }),
    [user, status, login, register, logout, setUser, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
