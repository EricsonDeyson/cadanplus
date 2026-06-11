import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import type { LoginResponse, Profile } from '../types';

interface AuthContextValue {
  profile: Profile | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<Profile>;
  logout: () => Promise<void>;
  setProfile: (profile: Profile) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura a sessão persistida pelo supabase-js ao abrir o app
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session && !cancelled) {
        try {
          const { profile } = await api<{ profile: Profile }>('/api/auth/me', {
            token: data.session.access_token,
          });
          if (!cancelled) setProfile(profile);
        } catch {
          await supabase.auth.signOut();
        }
      }
      if (!cancelled) setLoading(false);
    })();

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setProfile(null);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const data = await api<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
      token: null,
    });
    // Entrega a sessão ao supabase-js, que cuida da persistência e do refresh
    await supabase.auth.setSession({
      access_token: data.session.accessToken,
      refresh_token: data.session.refreshToken,
    });
    setProfile(data.profile);
    return data.profile;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({ profile, loading, login, logout, setProfile }),
    [profile, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return context;
}
