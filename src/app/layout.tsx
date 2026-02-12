
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
  return (
    <html lang="en">
      <body className={cn(
        "font-body antialiased bg-background text-foreground",
        poppins.variable,
        montserrat.variable,
        cinzel.variable
      )}>
        <LayoutProvider>
            {children}
        </LayoutProvider>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-TX702Y4CLS" />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-TX702Y4CLS');
          `}
        </Script>
      </body>
    </html>
  );
}
