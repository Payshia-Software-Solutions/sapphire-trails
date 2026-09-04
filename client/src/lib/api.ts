import { API_BASE_URL } from './utils';

export const AUTH_TOKEN_KEY = 'sapphire_token';

/**
 * Get stored auth token
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Store auth token
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

/**
 * Remove auth token
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

/**
 * Authenticated fetch helper that automatically attaches Bearer token header
 */
export async function authFetch(input: string, init?: RequestInit): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // If URL is relative, prepend API_BASE_URL
  const url = input.startsWith('http') ? input : `${API_BASE_URL}${input.startsWith('/') ? input : `/${input}`}`;

  const response = await fetch(url, {
    ...init,
    headers,
  });

  // Handle unauthorized/expired token
  if (response.status === 401 && typeof window !== 'undefined') {
    if (window.location.pathname.startsWith('/admin')) {
      removeAuthToken();
      localStorage.removeItem('adminUser');
      localStorage.removeItem('sapphire-user');
      window.location.href = '/auth?redirect=' + encodeURIComponent(window.location.pathname);
    }
  }

  return response;
}
