
'use client';

import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { PreloaderProvider } from '@/components/shared/preloader-provider';
import { Cinzel, Montserrat, Poppins } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/contexts/auth-context';
import { WhatsAppButton } from '@/components/shared/whatsapp-button';
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ScrollProvider, useScroll } from "@/contexts/scroll-context";

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

function BodyWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const bodyRef = useRef<HTMLBodyElement>(null);
  const { setScrollableElement } = useScroll();

  useEffect(() => {
    if (bodyRef.current) {
      setScrollableElement(bodyRef.current);
    }
  }, [setScrollableElement]);

  return (
    <body ref={bodyRef} className={cn(
      "font-body antialiased bg-background text-foreground",
      poppins.variable,
      montserrat.variable,
      cinzel.variable,
      isHomePage && 'overflow-hidden'
    )}>
      {children}
    </body>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <AuthProvider>
        <ScrollProvider>
          <BodyWrapper>
            <PreloaderProvider>
                {children}
            </PreloaderProvider>
            <WhatsAppButton />
            <Toaster />
          </BodyWrapper>
        </ScrollProvider>
      </AuthProvider>
    </html>
  );
}
