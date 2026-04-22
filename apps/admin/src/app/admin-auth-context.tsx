import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import {
  currentSession,
  login as loginRequest,
  logout as logoutRequest,
  type AdminLoginRequest,
  type AdminSession,
} from '../services/admin-auth';
import { AdminRequestError } from '../services/request';

type AdminAuthContextValue = {
  authError: string | null;
  isLoading: boolean;
  login: (payload: AdminLoginRequest) => Promise<AdminSession>;
  logout: () => Promise<void>;
  logoutError: string | null;
  session: AdminSession | null;
};

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

function isAuthFailure(error: unknown) {
  return error instanceof AdminRequestError && (error.status === 401 || error.status === 403);
}

function formatSessionError(error: unknown) {
  if (error instanceof AdminRequestError) {
    return '管理员会话加载失败，请稍后重试。';
  }

  return '管理员会话加载失败，请检查网络后重试。';
}

function formatLogoutError(error: unknown) {
  if (error instanceof AdminRequestError) {
    return '退出请求未完成，但本地会话已清理。';
  }

  return '退出请求未完成，但本地会话已清理。';
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const nextSession = await currentSession();

        if (active) {
          setSession(nextSession);
          setAuthError(null);
        }
      } catch (error) {
        if (active) {
          if (isAuthFailure(error)) {
            setSession(null);
            setAuthError(null);
          } else {
            setSession(null);
            setAuthError(formatSessionError(error));
          }
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
    setAuthError(null);
    setLogoutError(null);
    return nextSession;
  }

  async function logout() {
    setSession(null);
    setAuthError(null);
    setLogoutError(null);

    try {
      await logoutRequest();
    } catch (error) {
      setLogoutError(formatLogoutError(error));
    }
  }

  const value: AdminAuthContextValue = {
    authError,
    isLoading,
    login,
    logout,
    logoutError,
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
