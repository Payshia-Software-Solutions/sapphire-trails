'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { API_BASE_URL } from '@/lib/utils';
import { type AnalyticsConfig, trackPageView } from '@/lib/analytics';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const [config, setConfig] = useState<AnalyticsConfig | null>(null);
  const [isPixelInitialized, setIsPixelInitialized] = useState(false);
  const prevPathRef = useRef<string>('');

  // 1. Fetch live analytics configuration from Backend
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch(`${API_BASE_URL}/analytics/config/`);
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (e) {
        // Fallback default
        setConfig({
          google_analytics_id: 'G-TX702Y4CLS',
          meta_pixel_id: '',
          is_ga_enabled: true,
          is_pixel_enabled: false,
          exclude_admin_traffic: true,
          enable_ecommerce_events: true,
        });
      }
    }
    loadConfig();
  }, []);

  // 2. Initialize Meta Pixel when Pixel ID is present and enabled
  useEffect(() => {
    if (!config || !config.is_pixel_enabled || !config.meta_pixel_id || isPixelInitialized) {
      return;
    }

    const isAdmin = pathname.startsWith('/admin');
    if (isAdmin && config.exclude_admin_traffic) {
      return;
    }

    try {
      /* eslint-disable */
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = true;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s?.parentNode?.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */

      if (window.fbq) {
        window.fbq('init', config.meta_pixel_id);
        window.fbq('track', 'PageView');
        setIsPixelInitialized(true);
      }
    } catch (err) {
      console.warn("Could not initialize Meta Pixel:", err);
    }
  }, [config, pathname, isPixelInitialized]);

  // 3. Track Page Views on route transitions
  useEffect(() => {
    if (!config) return;

    const isAdmin = pathname.startsWith('/admin');
    if (isAdmin && config.exclude_admin_traffic) {
      return;
    }

    // Only fire if path changed
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      trackPageView(pathname);
    }
  }, [pathname, config]);

  if (!config) return null;

  const isAdmin = pathname.startsWith('/admin');
  const shouldSkipTracking = isAdmin && config.exclude_admin_traffic;

  return (
    <>
      {/* Google Analytics 4 Script (Conditional based on admin settings) */}
      {config.is_ga_enabled && config.google_analytics_id && !shouldSkipTracking && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${config.google_analytics_id}`}
          />
          <Script
            id="google-analytics-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${config.google_analytics_id}', {
                  page_path: window.location.pathname,
                  send_page_view: true
                });
              `,
            }}
          />
        </>
      )}

      {/* Google Tag Manager (if configured) */}
      {config.gtm_id && !shouldSkipTracking && (
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${config.gtm_id}');
            `,
          }}
        />
      )}

      {/* Meta Pixel NoScript Fallback */}
      {config.is_pixel_enabled && config.meta_pixel_id && !shouldSkipTracking && (
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            alt=""
            src={`https://www.facebook.com/tr?id=${config.meta_pixel_id}&ev=PageView&noscript=1`}
          />
        </noscript>
      )}
    </>
  );
}
