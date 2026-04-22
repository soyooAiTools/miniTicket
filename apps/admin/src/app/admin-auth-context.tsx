import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import {
  currentSession,
  login as loginRequest,
  logout as logoutRequest,
  type AdminLoginRequest,
  type AdminSession,
} from '../services/admin-auth';

type AdminAuthContextValue = {
  isLoading: boolean;
  login: (payload: AdminLoginRequest) => Promise<AdminSession>;
  logout: () => Promise<void>;
  session: AdminSession | null;
};

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const nextSession = await currentSession();

        if (active) {
          setSession(nextSession);
        }
      } catch {
        if (active) {
          setSession(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, []);

  async function login(payload: AdminLoginRequest) {
    const nextSession = await loginRequest(payload);
    setSession(nextSession);
    return nextSession;
  }

  async function logout() {
    await logoutRequest();
    setSession(null);
  }

  const value: AdminAuthContextValue = {
    isLoading,
    login,
    logout,
    session,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider.');
  }

  return context;
}
