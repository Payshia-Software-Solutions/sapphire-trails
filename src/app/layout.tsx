
'use client';

import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { PreloaderProvider } from '@/components/shared/preloader-provider';
import { Cinzel, Montserrat, Poppins } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/contexts/auth-context';
import { WhatsAppButton } from '@/components/shared/whatsapp-button';

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

// export const metadata: Metadata = {
//   title: 'Sapphire Trails',
//   description: "Sri Lanka's Only Luxury Gem Experience",
//   icons: {
//     icon: '/favicon.ico',
//     apple: '/apple-touch-icon.png',
//   },
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
          <title>Sapphire Trails</title>
          <meta name="description" content="Sri Lanka's Only Luxury Gem Experience" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={cn(
        "font-body antialiased bg-background text-foreground",
        poppins.variable,
        montserrat.variable,
        cinzel.variable
        )}>
            <AuthProvider>
                <PreloaderProvider>
                    {children}
                </PreloaderProvider>
                <WhatsAppButton />
                <Toaster />
            </AuthProvider>
      </body>
    </html>
  );
}
