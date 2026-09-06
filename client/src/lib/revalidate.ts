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

    const secret = process.env.NEXT_PUBLIC_REVALIDATION_SECRET || 'sapphire_secret_revalidate_2026';

    const response = await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret,
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
