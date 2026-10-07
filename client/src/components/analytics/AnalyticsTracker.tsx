'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { API_BASE_URL } from '@/lib/utils';
import { type AnalyticsConfig, trackPageView, setAnalyticsRuntimeConfig } from '@/lib/analytics';

interface AnalyticsTrackerProps {
  initialConfig?: AnalyticsConfig | null;
}

const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  google_analytics_id: 'G-TX702Y4CLS',
  meta_pixel_id: '',
  gtm_id: '',
  google_ads_id: '',
  google_ads_conversion_label: '',
  is_ga_enabled: true,
  is_pixel_enabled: false,
  is_gads_enabled: false,
  exclude_admin_traffic: true,
  enable_ecommerce_events: true,
};

export function AnalyticsTracker({ initialConfig }: AnalyticsTrackerProps = {}) {
  const pathname = usePathname();
  const [config, setConfig] = useState<AnalyticsConfig>(initialConfig || DEFAULT_ANALYTICS_CONFIG);
  const [isPixelInitialized, setIsPixelInitialized] = useState(false);
  const prevPathRef = useRef<string>('');

  // 1. Fetch live analytics configuration from Backend to ensure fresh config even if SSR was cached
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch(`${API_BASE_URL}/analytics/config/`);
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
          setAnalyticsRuntimeConfig(data);
        }
      } catch (e) {
        if (!initialConfig) {
          setConfig(DEFAULT_ANALYTICS_CONFIG);
          setAnalyticsRuntimeConfig(DEFAULT_ANALYTICS_CONFIG);
        }
      }
    }
    loadConfig();
  }, [initialConfig]);

  useEffect(() => {
    if (config) {
      setAnalyticsRuntimeConfig(config);
    }
  }, [config]);

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

  const hasGa = Boolean(config.is_ga_enabled && config.google_analytics_id);
  const hasGads = Boolean(config.is_gads_enabled && config.google_ads_id);
  const primaryGtagId = hasGa ? config.google_analytics_id : (hasGads ? config.google_ads_id : '');

  return (
    <>
      {/* Google Tag Script (GA4 & Google Ads) */}
      {(hasGa || hasGads) && primaryGtagId && !shouldSkipTracking && (
        <>
          <Script
            strategy="lazyOnload"
            src={`https://www.googletagmanager.com/gtag/js?id=${primaryGtagId}`}
          />
          <Script
            id="google-tag-init"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                ${hasGa ? `gtag('config', '${config.google_analytics_id}', { page_path: window.location.pathname, send_page_view: false });` : ''}
                ${hasGads ? `gtag('config', '${config.google_ads_id}');` : ''}
              `,
            }}
          />
        </>
      )}

      {/* Google Tag Manager (Deferred to idle time) */}
      {config.gtm_id && !shouldSkipTracking && (
        <Script
          id="google-tag-manager"
          strategy="lazyOnload"
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
