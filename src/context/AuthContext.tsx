import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  ChangePasswordPayload,
  UpdateProfilePayload,
} from '../types/auth';
import * as authService from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => void;
  refreshUser: () => Promise<AuthUser | null>;
  uploadProfilePhoto: (file: File) => Promise<AuthUser>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<AuthUser>;
  hasRole: (allowedRoles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session against backend on mount and enforce IST midnight auto-logout
  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      const storedToken = authService.getStoredToken();
      if (!storedToken) {
        if (mounted) {
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      // Check if session belongs to a previous Indian Time Zone (Asia/Kolkata) date
      const sessionISTDate = authService.getStoredISTDate();
      const currentISTDate = authService.getISTDateString();
      if (sessionISTDate && sessionISTDate !== currentISTDate) {
        console.warn(`[AuthContext] Session expired: day completed in Asia/Kolkata (stored=${sessionISTDate}, current=${currentISTDate}). Auto logging out.`);
        sessionStorage.setItem(authService.LOGOUT_REASON_KEY, 'eod_auto_logout');
        authService.clearStoredAuth();
        if (mounted) {
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const freshUser = await authService.getCurrentUser(storedToken);
        if (mounted) {
          if (freshUser && freshUser.workStatus?.toLowerCase() !== 'logged out') {
            setUser(freshUser);
            setToken(storedToken);
          } else {
            console.warn('[AuthContext] Session closed or employee marked as Logged Out. Clearing credentials.');
            sessionStorage.setItem(authService.LOGOUT_REASON_KEY, 'eod_auto_logout');
            authService.clearStoredAuth();
            setUser(null);
            setToken(null);
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Session verification failed. Redirecting to login:', err);
        if (mounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    // 1. Midnight Watcher for Indian Standard Time (Asia/Kolkata)
    // Runs every 10 seconds to detect 23:59:59 -> 00:00:00 IST rollover
    const checkMidnightIST = () => {
      const currentToken = authService.getStoredToken();
      if (!currentToken) return;

      const storedISTDate = authService.getStoredISTDate();
      const currentISTDate = authService.getISTDateString();

      if (storedISTDate && storedISTDate !== currentISTDate) {
        console.warn(`[AuthContext] Working day completed in Asia/Kolkata timezone (stored=${storedISTDate}, current=${currentISTDate}). Auto-logging out.`);
        sessionStorage.setItem(authService.LOGOUT_REASON_KEY, 'eod_auto_logout');
        authService.clearStoredAuth();
        if (mounted) {
          setUser(null);
          setToken(null);
        }
        window.dispatchEvent(new CustomEvent('crm-session-expired', { detail: { reason: 'eod_auto_logout' } }));
      }
    };

    const midnightTimer = setInterval(checkMidnightIST, 10000);

    // 2. Periodic heartbeat & tab focus verification against backend
    const verifyActiveSession = async () => {
      const currentToken = authService.getStoredToken();
      if (!currentToken || document.visibilityState === 'hidden') return;

      try {
        const freshUser = await authService.getCurrentUser(currentToken);
        if (!freshUser || freshUser.workStatus?.toLowerCase() === 'logged out') {
          console.warn('[AuthContext] Periodic check detected inactive or logged out session.');
          sessionStorage.setItem(authService.LOGOUT_REASON_KEY, 'eod_auto_logout');
          authService.clearStoredAuth();
          if (mounted) {
            setUser(null);
            setToken(null);
          }
          window.dispatchEvent(new CustomEvent('crm-session-expired', { detail: { reason: 'eod_auto_logout' } }));
        }
      } catch {
        // Handled in getCurrentUser
      }
    };

    const heartbeatTimer = setInterval(verifyActiveSession, 60000);
    window.addEventListener('focus', verifyActiveSession);

    const handleSessionExpired = () => {
      if (mounted) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
      }
    };
    window.addEventListener('crm-session-expired', handleSessionExpired);

    return () => {
      mounted = false;
      clearInterval(midnightTimer);
      clearInterval(heartbeatTimer);
      window.removeEventListener('focus', verifyActiveSession);
      window.removeEventListener('crm-session-expired', handleSessionExpired);
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      setUser(res.user);
      setToken(res.token);
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (payload: ChangePasswordPayload): Promise<void> => {
    const updated = await authService.changePassword(payload);
    setUser(updated);
    if (token) {
      authService.setStoredAuth(token, updated, true);
    }
  }, [token]);

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    const currentToken = token || authService.getStoredToken();
    if (!currentToken) return null;
    try {
      const freshUser = await authService.getCurrentUser(currentToken);
      if (freshUser) {
        setUser(freshUser);
        return freshUser;
      }
      return null;
    } catch (e) {
      console.warn('[AuthContext] Failed to refresh user profile:', e);
      return null;
    }
  }, [token]);

  const uploadProfilePhoto = useCallback(async (file: File): Promise<AuthUser> => {
    const updated = await authService.uploadProfilePhoto(file);
    setUser(updated);
    const currentToken = token || authService.getStoredToken();
    if (currentToken) {
      authService.setStoredAuth(currentToken, updated, true);
    }
    return updated;
  }, [token]);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload): Promise<AuthUser> => {
    const updated = await authService.updateProfile(payload);
    setUser(updated);
    const currentToken = token || authService.getStoredToken();
    if (currentToken) {
      authService.setStoredAuth(currentToken, updated, true);
    }
    return updated;
  }, [token]);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updates };
      const currentToken = authService.getStoredToken();
      if (currentToken) {
        authService.setStoredAuth(currentToken, next, true);
      }
      return next;
    });
  }, []);

  const hasRole = useCallback((allowedRoles: string[]): boolean => {
    if (!user) return false;
    if (allowedRoles.length === 0) return true;
    const userRole = (user.accessRole || user.role || '').toLowerCase();
    if (userRole === 'super admin' || userRole === 'admin') return true;
    return allowedRoles.some((r) => {
      const nr = r.toLowerCase();
      if (nr === userRole) return true;
      if ((nr === 'sales manager' || nr === 'manager') && (userRole === 'sales manager' || userRole === 'manager')) return true;
      return false;
    });
  }, [user]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    // Wildcard: Super Admin / Admin always have all permissions
    const role = (user.accessRole || user.role || '').toLowerCase();
    if (role === 'super admin' || role === 'admin') return true;
    // Guard: if no permissions list at all, deny access (do NOT default to true)
    if (!user.permissions || user.permissions.length === 0) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        changePassword,
        updateUser,
        refreshUser,
        uploadProfilePhoto,
        updateProfile,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
