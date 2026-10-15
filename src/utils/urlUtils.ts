/**
 * Utility to sanitize and normalize URLs for network requests (Fetch API)
 * and browser location state.
 *
 * Browsers following the WHATWG Fetch standard forbid fetch requests
 * to URLs with embedded credentials (e.g. `http://user@host` or `http://user:pass@host`),
 * throwing:
 *   "TypeError: Failed to execute 'fetch' on 'Window': Request cannot be constructed from a URL that includes credentials"
 *
 * This error also occurs when relative URLs (e.g. `/api/auth/login`) are fetched
 * while the browser address bar (document.baseURI) contains credentials.
 */

/**
 * Resolves any relative or absolute URL against the clean browser origin
 * and strips any embedded username/password credentials.
 */
export function buildSafeApiUrl(inputUrl: string): string {
  try {
    if (!inputUrl) return inputUrl;

    // Use window.location.origin as base.
    // By the WHATWG URL standard, origin NEVER contains username or password.
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'http://localhost';

    const urlObj = new URL(inputUrl, origin);

    // Strip any embedded credentials
    urlObj.username = '';
    urlObj.password = '';

    return urlObj.toString();
  } catch {
    return inputUrl;
  }
}

/**
 * Sanitizes the current browser location if credentials exist in the address bar
 * (for instance if a user navigates to `http://ec2-user@18.143.152.101/...`).
 */
export function sanitizeBrowserLocation(): void {
  if (typeof window === 'undefined') return;

  try {
    const loc = new URL(window.location.href);
    if (loc.username || loc.password) {
      loc.username = '';
      loc.password = '';
      const cleanUrl = `${loc.origin}${loc.pathname}${loc.search}${loc.hash}`;
      window.history.replaceState(null, '', cleanUrl);
    }
  } catch (e) {
    console.warn('[URL] Unable to sanitize location bar:', e);
  }
}

/**
 * Intercepts global window.fetch to ensure no fetch call fails due to embedded credentials.
 */
export function installSafeFetchInterceptor(): void {
  if (typeof window === 'undefined' || !window.fetch) return;

  if ((window as any).__safeFetchInstalled) return;
  (window as any).__safeFetchInstalled = true;

  const originalFetch = window.fetch;
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (typeof input === 'string') {
      return originalFetch.call(this, buildSafeApiUrl(input), init);
    }
    if (input instanceof URL) {
      return originalFetch.call(this, buildSafeApiUrl(input.toString()), init);
    }
    return originalFetch.call(this, input, init);
  };
}
