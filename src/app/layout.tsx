
import type { Metadata } from 'next';
import './globals.css';
import { Cinzel, Montserrat, Poppins } from 'next/font/google';
import { cn } from '@/lib/utils';
import { LayoutProvider } from '@/components/layout-provider';

export const metadata: Metadata = {
  title: {
    template: '%s | Sapphire Trails',
    default: 'Sapphire Trails - Sri Lanka\'s Premier Luxury Gem Tour Experience',
  },
  description: 'Embark on an exclusive journey through Sri Lanka\'s gem country. Sapphire Trails offers an immersive experience into Ratnapura\'s rich heritage, from gem mines to luxury stays.',
  openGraph: {
    title: 'Sapphire Trails - Sri Lanka\'s Premier Luxury Gem Tour Experience',
    description: 'Discover the heart of Sri Lanka\'s gem country with our exclusive tours.',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
      width: 1200,
      height: 630,
      alt: 'A dark and moody image of the inside of a gem mine.'
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
      </body>
    </html>
  );
}
