
import type { Metadata } from 'next';
import './globals.css';
// import { Cinzel, Montserrat, Poppins } from 'next/font/google';
import { cn } from '@/lib/utils';
import { LayoutProvider } from '@/components/layout-provider';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';

export const metadata: Metadata = {
  metadataBase: new URL('https://sapphiretrails.lk'),
  alternates: {
    canonical: '/',
  },
  title: {
    template: '%s | Sapphire Trails - Sri Lanka Gem Tours',
    default: 'Gem Mine Tours Sri Lanka | Sapphire Trails - Luxury Ratnapura Mining Trips',
  },
  description: 'Book the ultimate Gem Mine Tour in Ratnapura (Rathnapura), Sri Lanka. Experience active mining pits, traditional gem washing, and private luxury sapphire tours with Sapphire Trails.',
  keywords: [
    'Gem mining Rathnapura',
    'Gem mining Ratnapura',
    'Gem tours',
    'gem mine tours',
    'gem mine tours rathnapura',
    'sri lanka gem mine tour',
    'srilankan gem tours',
    'sri lankan gem tours',
    'gem mining tour',
    'Ceylon sapphire tours',
    'Ratnapura gem market',
    'gem washing experience Sri Lanka'
  ],
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
    title: 'Gem Mine Tours Sri Lanka | Sapphire Trails - Luxury Ratnapura Mining Trips',
    description: 'Book the ultimate Gem Mine Tour in Ratnapura (Rathnapura), Sri Lanka. Experience active mining pits, traditional gem washing, and luxury service with Sapphire Trails.',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
      width: 1200,
      height: 630,
      alt: 'Inside a gem mine on a Sapphire Trails gem tour in Sri Lanka.'
    }],
  }
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Sapphire Trails",
    "url": "https://sapphiretrails.lk",
    "logo": "https://sapphiretrails.lk/img/logo4.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Grand Silver Ray, Colombo - Batticaloa Hwy",
      "addressLocality": "Ratnapura",
      "addressCountry": "LK"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+94-76-375-6688",
      "contactType": "Customer Service",
      "areaServed": "LK",
      "availableLanguage": ["en"]
    },
    "sameAs": [
      "https://www.facebook.com/p/Sapphire-Trails-61573050367074/",
      "https://instagram.com",
      "https://youtube.com"
    ]
  };

  const websiteStructuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": "https://sapphiretrails.lk",
      "name": "Sapphire Trails",
      "description": "Discover the best gem tours in Ratnapura, Sri Lanka with Sapphire Trails. Experience authentic gem mining, explore cultural heritage, and enjoy luxury stays.",
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
      "Rathnapura Gem Mining Tour",
      "Sri Lankan Gem Tours",
      "Ceylon Gem Mine Tour"
    ],
    "description": "Authentic and luxury gem mine tours in Ratnapura (Rathnapura), Sri Lanka. Experience active underground mining pit descent, traditional river gem gravel washing, and certified gemologist consultations.",
    "touristType": ["EcoTourism", "CulturalTourism", "GemstoneTourism", "LuxuryTourism"],
    "location": {
      "@type": "Place",
      "name": "Ratnapura, Sri Lanka",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Ratnapura",
        "addressRegion": "Sabaragamuwa",
        "addressCountry": "LK"
      }
    }
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var theme = stored ? stored : 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Poppins:wght@300;400;500;600&family=Montserrat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --font-cinzel: 'Cinzel', serif;
            --font-poppins: 'Poppins', sans-serif;
            --font-montserrat: 'Montserrat', sans-serif;
          }
        `}} />
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationSchema) }}
        />
        <LayoutProvider>
            {children}
        </LayoutProvider>
        <AnalyticsTracker />
      </body>
    </html>
  );
}
