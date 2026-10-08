import {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from '../types/auth';

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string)?.replace(/\/leads$/, '') || '';
const AUTH_API_URL = `${API_BASE_URL}/api/auth`;

export const TOKEN_STORAGE_KEY = 'tk_crm_auth_token';
export const USER_STORAGE_KEY = 'tk_crm_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredAuth(token: string, user: AuthUser, rememberMe: boolean = false): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('[AuthService] Storage write error:', e);
  }
}

export function clearStoredAuth(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
  } catch (e) {
    console.error('[AuthService] Storage clear error:', e);
  }
}

/**
 * Authenticate employee with username/email & password
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const res = await fetch(`${AUTH_API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Login failed (HTTP ${res.status})`);
  }

  const data: LoginResponse = await res.json();
  setStoredAuth(data.token, data.user, credentials.rememberMe);
  return data;
}

/**
 * Fetch and strictly verify authenticated employee profile with backend session
 */
export async function getCurrentUser(token?: string): Promise<AuthUser | null> {
  const authToken = token || getStoredToken();
  if (!authToken) {
    clearStoredAuth();
    return null;
  }

  try {
    const res = await fetch(`${AUTH_API_URL}/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      // Backend rejected or expired the session token -> clear stored credentials
      clearStoredAuth();
      return null;
    }

    const user: AuthUser = await res.json();
    setStoredAuth(authToken, user, true);
    return user;
  } catch (error) {
    console.warn('[AuthService] Error validating token with backend. Clearing session:', error);
    clearStoredAuth();
    return null;
  }
}

/**
 * Log out and invalidate session
 */
export async function logout(): Promise<void> {
  const token = getStoredToken();
  if (token) {
    try {
      await fetch(`${AUTH_API_URL}/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        credentials: 'include',
      });
    } catch (error) {
      console.warn('[AuthService] Logout request warning:', error);
    }
  }
  clearStoredAuth();
}

/**
 * Change / update password for authenticated user
 */
export async function changePassword(payload: ChangePasswordPayload): Promise<AuthUser> {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${AUTH_API_URL}/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Password update failed (HTTP ${res.status})`);
  }

  const updatedUser: AuthUser = await res.json();
  setStoredAuth(token, updatedUser, true);
  return updatedUser;
}

/**
 * Request password reset token / email
 */
export async function forgotPassword(payload: ForgotPasswordPayload): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${AUTH_API_URL}/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Forgot password request failed');
  }

  return await res.json();
}

/**
 * Reset password using token
 */
export async function resetPassword(payload: ResetPasswordPayload): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${AUTH_API_URL}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Password reset failed');
  }

  return await res.json();
}

/**
 * Verify token validity
 */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${AUTH_API_URL}/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}
