
'use client';

import { Toaster } from "@/components/ui/toaster";
import { PreloaderProvider } from '@/components/shared/preloader-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { WhatsAppButton } from '@/components/shared/whatsapp-button';
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ScrollProvider, useScroll } from "@/contexts/scroll-context";

function BodyEffectManager() {
  const pathname = usePathname();
  const { setScrollableElement } = useScroll();

  useEffect(() => {
    // The homepage manages its own scroll container, but for other pages,
    // we set the body as the main scrollable element.
    if (pathname !== '/') {
        setScrollableElement(document.body);
    }
  }, [pathname, setScrollableElement]);

  useEffect(() => {
    // This effect adds/removes the `overflow-hidden` class on the body tag.
    // This is necessary for the homepage's full-screen scroll-snapping effect.
    const isHomePage = pathname === '/';
    if (isHomePage) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    // Cleanup function to ensure the class is removed on component unmount.
    return () => {
        document.body.classList.remove('overflow-hidden');
    };
  }, [pathname]);

  return null; // This component does not render anything, it only manages side effects.
}


export function LayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ScrollProvider>
        <BodyEffectManager />
        <PreloaderProvider>
            {children}
        </PreloaderProvider>
        <WhatsAppButton />
        <Toaster />
      </ScrollProvider>
    </AuthProvider>
  );
}
