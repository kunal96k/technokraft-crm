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

  // Validate session against backend on mount
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

      try {
        const freshUser = await authService.getCurrentUser(storedToken);
        if (mounted) {
          if (freshUser) {
            setUser(freshUser);
            setToken(storedToken);
          } else {
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
    return allowedRoles.some((r) => r.toLowerCase() === userRole || userRole === 'super admin' || userRole === 'admin');
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
