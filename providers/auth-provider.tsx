import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { authService, LoginPayload, RegisterPayload } from '@/services/authService';
import { AuthResponse, User } from '@/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (payload: LoginPayload) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService.getStoredSession().then(async (stored) => {
      if (!stored) {
        setIsLoading(false);
        return;
      }

      try {
        const user = await authService.me();
        setSession({ token: stored.token, user });
      } catch {
        await authService.logout();
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    token: session?.token ?? null,
    isLoading,
    signIn: async (payload) => {
      const result = await authService.login(payload);
      setSession(result);
    },
    signUp: async (payload) => {
      const result = await authService.register(payload);
      setSession(result);
    },
    signOut: async () => {
      await authService.logout();
      setSession(null);
    },
  }), [isLoading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
