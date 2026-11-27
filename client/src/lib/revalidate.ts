import { getAuthToken } from './api';

/**
 * Helper to trigger Next.js On-Demand ISR Cache Revalidation.
 * Can be called after creating, updating, or deleting content in Admin panels.
 * 
 * Runs without blocking or throwing errors to the user.
 */
export async function triggerRevalidation(
  paths: string | string[],
  tags?: string | string[]
): Promise<boolean> {
  try {
    const pathList = Array.isArray(paths) ? paths : [paths];
    const tagList = tags ? (Array.isArray(tags) ? tags : [tags]) : [];
    const token = getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/revalidate', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        paths: pathList,
        tags: tagList,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.warn('[Revalidate] Notice from /api/revalidate:', data);
      return false;
    }

    const res = await response.json();
    console.log('[Revalidate] Successfully purged cache for:', res.revalidatedPaths || res.revalidatedTags);
    return true;
  } catch (error) {
    console.warn('[Revalidate] Revalidation trigger skipped or network error:', error);
    return false;
  }
}
