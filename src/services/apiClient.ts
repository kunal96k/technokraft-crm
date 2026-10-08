import { getStoredToken, clearStoredAuth } from './authService';

/**
 * Returns request headers populated with session authorization tokens.
 */
export function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...customHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['X-Session-Token'] = token;
  }
  return headers;
}

/**
 * Enhanced fetch wrapper that automatically attaches session credentials and handles 401 Unauthorized.
 */
export async function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(init.headers || {});

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('X-Session-Token', token);
  }

  const mergedInit: RequestInit = {
    ...init,
    headers,
    credentials: init.credentials || 'include',
  };

  try {
    const res = await fetch(url, mergedInit);
    if (res.status === 401) {
      const currentPath = window.location.pathname;
      const isPublicAuthPage =
        currentPath.includes('/login') ||
        currentPath.includes('/forgot-password') ||
        currentPath.includes('/reset-password');

      if (!isPublicAuthPage) {
        console.warn('[ApiClient] 401 Unauthorized received. Session expired or missing. Redirecting to login.');
        clearStoredAuth();
        window.dispatchEvent(new Event('crm-session-expired'));
      }
    }
    return res;
  } catch (err) {
    throw err;
  }
}
