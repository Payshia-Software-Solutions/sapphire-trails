
'use client';

import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { PreloaderProvider } from '@/components/shared/preloader-provider';
import { Cinzel, Montserrat, Poppins } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { WhatsAppButton } from '@/components/shared/whatsapp-button';
import { LoaderCircle, WifiOff } from 'lucide-react';

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

function AppContent({ children }: { children: React.ReactNode }) {
    const { serverStatus } = useAuth();

    if (serverStatus === 'connecting') {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background text-foreground">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Connecting to server...</p>
            </div>
        )
    }

    if (serverStatus === 'error') {
         return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background text-foreground">
                <WifiOff className="h-12 w-12 text-destructive" />
                <h2 className="text-xl font-semibold">Connection Error</h2>
                <p className="text-muted-foreground text-center max-w-sm">Could not connect to the backend server. Please check your connection or try again later.</p>
            </div>
        )
    }
    
    return (
      <>
        <PreloaderProvider>
          {children}
        </PreloaderProvider>
        <WhatsAppButton />
        <Toaster />
      </>
    );
}

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
                <AppContent>{children}</AppContent>
            </AuthProvider>
      </body>
    </html>
  );
}
