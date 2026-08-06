
'use client';

import { Toaster } from "@/components/ui/toaster";
import { PreloaderProvider } from '@/components/shared/preloader-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { WhatsAppButton } from '@/components/shared/whatsapp-button';
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ScrollProvider, useScroll } from "@/contexts/scroll-context";
import { ThemeProvider } from "@/contexts/theme-context";

function BodyEffectManager() {
  const { setScrollableElement } = useScroll();

  useEffect(() => {
    // Set the body as the main scrollable element for all pages.
    setScrollableElement(document.body);
    
    // Ensure overflow is not hidden from the previous scroll-snap implementation
    document.body.classList.remove('overflow-hidden');

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [setScrollableElement]);


  return null; // This component does not render anything, it only manages side effects.
}


export function LayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ScrollProvider>
          <BodyEffectManager />
          <PreloaderProvider>
              {children}
          </PreloaderProvider>
          <WhatsAppButton />
          <Toaster />
        </ScrollProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
