
import type { Metadata } from 'next';
import './globals.css';
import { Cinzel, Montserrat, Poppins } from 'next/font/google';
import { cn, API_BASE_URL } from '@/lib/utils';
import { LayoutProvider } from '@/components/layout-provider';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';
import type { AnalyticsConfig } from '@/lib/analytics';
import { defaultSeoSettings } from '@/lib/site-seo';
import { fetchSiteContentServer } from '@/lib/site-content';
import { SiteContentProvider } from '@/contexts/site-content-context';

async function fetchAnalyticsConfigServer(): Promise<AnalyticsConfig | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/config/`, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[fetchAnalyticsConfigServer] Failed to fetch analytics config:', err);
  }
  return null;
}

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await fetchSiteContentServer();
  const seo = siteContent.settings?.seo || defaultSeoSettings;

  const title = seo.metaTitle || defaultSeoSettings.metaTitle;
  const description = seo.metaDescription || defaultSeoSettings.metaDescription;
  const keywords = (seo.keywords && seo.keywords.length > 0) ? seo.keywords : defaultSeoSettings.keywords;
  const ogImage = seo.ogImage || defaultSeoSettings.ogImage;

  return {
    metadataBase: new URL('https://sapphiretrails.lk'),
    alternates: {
      canonical: './',
    },
    title: {
      template: '%s | Sapphire Trails',
      default: title,
    },
    description,
    keywords,
    icons: {
      icon: [
        { url: '/img/favicon.ico' },
        { url: '/img/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/img/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/img/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/img/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      shortcut: '/img/favicon.ico',
      apple: [
        { url: '/img/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    manifest: '/site.webmanifest',
    openGraph: {
      title,
      description,
      url: 'https://sapphiretrails.lk',
      siteName: 'Sapphire Trails Sri Lanka',
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: title,
      }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [siteContent, analyticsConfig] = await Promise.all([
    fetchSiteContentServer(),
    fetchAnalyticsConfigServer(),
  ]);
  const seo = siteContent.settings?.seo || defaultSeoSettings;
  const contact = siteContent.contact;
  const footer = siteContent.footer;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["Organization", "TravelAgency"],
    "name": "Sapphire Trails",
    "url": "https://sapphiretrails.lk",
    "logo": "https://sapphiretrails.lk/img/logo4.png",
    "image": "https://content-provider.payshia.com/sapphire-trail/images/img37.webp",
    "description": seo.metaDescription,
    "priceRange": "$$",
    "currenciesAccepted": "USD, LKR, EUR, GBP",
    "paymentAccepted": "Cash, Credit Card, Bank Transfer",
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 6.6828,
      "longitude": 80.4036
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": contact?.physicalAddress || "Grand Silver Ray, Colombo - Batticaloa Hwy",
      "addressLocality": "Ratnapura",
      "addressRegion": "Sabaragamuwa Province",
      "postalCode": "70000",
      "addressCountry": "LK"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": contact?.primaryPhone || "+94-76-375-6688",
      "contactType": "Customer Service",
      "areaServed": "LK",
      "availableLanguage": ["en", "si"]
    },
    "sameAs": [
      footer?.facebookUrl || "https://www.facebook.com/p/Sapphire-Trails-61573050367074/",
      footer?.instagramUrl || "https://instagram.com",
      footer?.tripadvisorUrl || "https://www.tripadvisor.com",
      footer?.youtubeUrl || "https://youtube.com"
    ]
  };

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://sapphiretrails.lk",
    "name": "Sapphire Trails",
    "description": seo.metaDescription,
    "publisher": {
      "@type": "Organization",
      "name": "Sapphire Trails",
      "logo": {
        "@type": "ImageObject",
        "url": "https://sapphiretrails.lk/img/logo4.png"
      }
    }
  };

  const touristAttractionSchema = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "name": "Sapphire Trails Gem Mine Tours",
    "alternateName": [
      "Ratnapura Gem Mine Tours",
      "Traditional Gem Mining Sri Lanka",
      "Ceylon Sapphire Mining Experience",
      "Ethical Gem Mine Visit Ratnapura"
    ],
    "description": seo.metaDescription,
    "url": "https://sapphiretrails.lk",
    "image": "https://content-provider.payshia.com/sapphire-trail/images/img37.webp",
    "touristType": ["EcoTourism", "CulturalTourism", "GemstoneTourism"],
    "isAccessibleForFree": false,
    "publicAccess": true,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 6.6828,
      "longitude": 80.4036
    },
    "location": {
      "@type": "Place",
      "name": "Ratnapura Gem Mines, Sri Lanka",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": contact?.physicalAddress || "Grand Silver Ray, Colombo - Batticaloa Hwy",
        "addressLocality": "Ratnapura",
        "addressRegion": "Sabaragamuwa Province",
        "postalCode": "70000",
        "addressCountry": "LK"
      }
    },
    "provider": {
      "@type": "TravelAgency",
      "name": "Sapphire Trails",
      "url": "https://sapphiretrails.lk"
    }
  };

  // Dynamic FAQPage Schema for Featured Snippet Domination
  const activeFaqs = (seo.faqs && seo.faqs.length > 0) ? seo.faqs : defaultSeoSettings.faqs;
  const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": activeFaqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const siteNavigationSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Sapphire Trails Navigation",
    "itemListElement": [
      {
        "@type": "SiteNavigationElement",
        "position": 1,
        "name": "Gem Mine Tours",
        "description": "Book authentic gem mine tours and packages in Ratnapura.",
        "url": "https://sapphiretrails.lk/tours"
      },
      {
        "@type": "SiteNavigationElement",
        "position": 2,
        "name": "Explore Ratnapura",
        "description": "Discover attractions, gem markets, and culture in the City of Gems.",
        "url": "https://sapphiretrails.lk/explore-ratnapura"
      },
      {
        "@type": "SiteNavigationElement",
        "position": 3,
        "name": "Articles & Guides",
        "description": "Authoritative guides on Ceylon sapphires and gem mining expeditions.",
        "url": "https://sapphiretrails.lk/articles"
      },
      {
        "@type": "SiteNavigationElement",
        "position": 4,
        "name": "About Us",
        "description": "Learn about Sapphire Trails and our ethical mining heritage.",
        "url": "https://sapphiretrails.lk/about"
      },
      {
        "@type": "SiteNavigationElement",
        "position": 5,
        "name": "Contact Us",
        "description": "Get in touch with our concierge team for custom tour bookings.",
        "url": "https://sapphiretrails.lk/contact"
      }
    ]
  };

  return (
    <html lang="en" className={cn("light", cinzel.variable, montserrat.variable, poppins.variable)} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var theme = stored;
                  if (!theme) {
                    var siteDefault = localStorage.getItem('site_default_theme');
                    if (siteDefault === 'dark' || siteDefault === 'light') {
                      theme = siteDefault;
                    } else {
                      try {
                        var cached = localStorage.getItem('sapphire_site_content_cache');
                        if (cached) {
                          var parsed = JSON.parse(cached);
                          if (parsed && parsed.settings && (parsed.settings.defaultTheme === 'dark' || parsed.settings.defaultTheme === 'light')) {
                            theme = parsed.settings.defaultTheme;
                          }
                        }
                      } catch (err) {}
                    }
                  }
                  if (!theme) {
                    theme = 'light';
                  }
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
        {/* Preconnect to content-provider CDN for fast LCP image delivery */}
        <link rel="preconnect" href="https://content-provider.payshia.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://content-provider.payshia.com" />
      </head>
      <body className={cn(
        "font-body antialiased bg-background text-foreground"
      )}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(touristAttractionSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationSchema) }}
        />
        <SiteContentProvider initialContent={siteContent}>
          <LayoutProvider>
              {children}
          </LayoutProvider>
        </SiteContentProvider>
        <AnalyticsTracker initialConfig={analyticsConfig} />
      </body>
    </html>
  );
}
