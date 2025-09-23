'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';

type EthereumProvider = {
  isMetaMask?: boolean;
  providers?: EthereumProvider[];
  request: (args: { method: string; params?: any[] | object }) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
};

const Ctx = createContext<{
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refresh: async () => {},
});

function pickMetaMaskProvider(): EthereumProvider | null {
  if (typeof window === 'undefined') return null;
  const anyWin = window as any;
  const ethereum: EthereumProvider | undefined = anyWin.ethereum;

  if (!ethereum) return null;
  if (Array.isArray(ethereum.providers) && ethereum.providers.length > 0) {
    const metamask = ethereum.providers.find((p: EthereumProvider) => p.isMetaMask);
    if (metamask) return metamask;
    return ethereum.providers[0];
  }
  return ethereum;
}

async function getMetaMask(): Promise<EthereumProvider | null> {
  const provider = pickMetaMaskProvider();
  return provider || null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const refresh = async () => {
    try {
      const res = await apiFetch('/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.data || data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Login failed');
    }
    await refresh();
    router.push('/');
  };

  const register = async (email: string, username: string, password: string, bio?: string) => {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password, bio }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Registration failed');
    }
    await refresh();
    router.push('/');
  };

  const logout = async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  return (
    <Ctx.Provider value={{ user, login, register, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}