'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SiteContentData } from '@/lib/site-content';
import {
  defaultSiteContent,
  fetchSiteContent,
  mergeAllSiteContent,
  SITE_CONTENT_CHANGE_EVENT,
  SITE_CONTENT_STORAGE_KEY,
} from '@/lib/site-content';

interface SiteContentContextValue {
  content: SiteContentData;
  isLoaded: boolean;
  refetch: () => Promise<SiteContentData>;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({
  initialContent,
  children,
}: {
  initialContent?: SiteContentData;
  children: React.ReactNode;
}) {
  const [content, setContent] = useState<SiteContentData>(() => {
    return initialContent || defaultSiteContent;
  });
  const [isLoaded, setIsLoaded] = useState<boolean>(true);

  // Synchronize state whenever initialContent from SSR changes (e.g., page navigation with new server data)
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(SITE_CONTENT_STORAGE_KEY, JSON.stringify(initialContent));
          if (initialContent.settings?.defaultTheme) {
            localStorage.setItem('site_default_theme', initialContent.settings.defaultTheme);
          }
        } catch (e) {
          // Ignore localStorage write errors
        }
      }
    }
  }, [initialContent]);

  // Listen for admin changes or storage updates across tabs, without ever firing redundant network requests on normal page loads
  useEffect(() => {
    const handleSync = async () => {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(SITE_CONTENT_STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setContent(mergeAllSiteContent(parsed));
            return;
          } catch (e) {}
        }
        // If no cache, perform single deduplicated fetch
        const fresh = await fetchSiteContent();
        setContent(fresh);
      }
    };

    window.addEventListener(SITE_CONTENT_CHANGE_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener(SITE_CONTENT_CHANGE_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const refetch = async (): Promise<SiteContentData> => {
    const latest = await fetchSiteContent();
    setContent(latest);
    return latest;
  };

  return (
    <SiteContentContext.Provider value={{ content, isLoaded, refetch }}>
      {children}
    </SiteContentContext.Provider>
  );
}

/**
 * Universal React Hook for public and admin components to access dynamic site content.
 * Reads instantly from SSR-hydrated Context with 0 duplicate network requests on mount.
 */
export function useSiteContent(): {
  content: SiteContentData;
  isLoaded: boolean;
  refetch: () => Promise<SiteContentData>;
} {
  const context = useContext(SiteContentContext);
  if (!context || !context.content) {
    return {
      content: defaultSiteContent,
      isLoaded: true,
      refetch: async () => defaultSiteContent,
    };
  }
  return context;
}
