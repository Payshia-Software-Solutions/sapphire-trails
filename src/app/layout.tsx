
import type { Metadata } from 'next';
import './globals.css';
import { Cinzel, Montserrat, Poppins } from 'next/font/google';
import { cn } from '@/lib/utils';
import { LayoutProvider } from '@/components/layout-provider';
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    template: '%s | Sapphire Trails',
    default: 'Sapphire Trails - Premier Gem Tours in Ratnapura, Sri Lanka',
  },
  description: 'Discover the best gem tours in Ratnapura, Sri Lanka with Sapphire Trails. Experience authentic gem mining, explore cultural heritage, and enjoy luxury stays. Book your Sri Lankan gem tour today.',
  openGraph: {
    title: 'Sapphire Trails - Premier Gem Tours in Ratnapura, Sri Lanka',
    description: 'Discover the heart of Sri Lanka\'s gem country with our exclusive gem tours.',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
      width: 1200,
      height: 630,
      alt: 'Inside a gem mine on a Sapphire Trails gem tour in Sri Lanka.'
    }],
  }
};


const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['400', '500'],
});

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['700'],
});

const cinzel = Cinzel({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cinzel',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Sapphire Trails",
    "url": "https://www.sapphiretrails.com",
    "logo": "https://www.sapphiretrails.com/img/logo4.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+94-71-235-7700",
      "contactType": "Customer Service",
      "areaServed": "LK",
      "availableLanguage": ["en"]
    },
    "sameAs": [
      "https://facebook.com",
      "https://instagram.com",
      "https://youtube.com"
    ]
  };

  const websiteStructuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": "https://www.sapphiretrails.com",
      "name": "Sapphire Trails",
      "description": "Discover the best gem tours in Ratnapura, Sri Lanka with Sapphire Trails. Experience authentic gem mining, explore cultural heritage, and enjoy luxury stays.",
      "publisher": {
          "@type": "Organization",
          "name": "Sapphire Trails",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.sapphiretrails.com/img/logo4.png"
          }
      }
  };

  return (
    <html lang="en">
      <body className={cn(
        "font-body antialiased bg-background text-foreground",
        poppins.variable,
        montserrat.variable,
        cinzel.variable
      )}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
        />
        <LayoutProvider>
            {children}
        </LayoutProvider>
        <Script 
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-TX702Y4CLS" 
        />
        <Script 
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-TX702Y4CLS');
            `
          }}
        />
      </body>
    </html>
  );
}
