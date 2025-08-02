
'use client';

import { usePathname } from 'next/navigation';
import { PreLoader } from './pre-loader';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const isInitialLoad = useRef(true);

    // This effect handles the visibility of the preloader.
    useEffect(() => {
        // On initial load, always show preloader.
        // On subsequent navigations, the click handler below will set isLoading.
        if (isInitialLoad.current) {
            setIsLoading(true);
        }
        
        const delay = isInitialLoad.current ? 1000 : 200;
        
        const timer = setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
                setIsLoading(false);
                setIsFadingOut(false);
                if (isInitialLoad.current) {
                    isInitialLoad.current = false;
                }
                // Scroll to top after animation is fully complete
                window.scrollTo({ top: 0, behavior: 'instant' });
            }, 500); // This duration must match the CSS transition time
        }, delay);
        
        return () => clearTimeout(timer);
    }, [pathname]);

    // This effect adds a click listener to show the preloader on navigation.
    useEffect(() => {
        const handleAnchorClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const anchor = target.closest('a');

            if (anchor && anchor.href) {
                const targetUrl = new URL(anchor.href, window.location.origin);
                const isExternal = targetUrl.origin !== window.location.origin;
                const isSamePageNav = targetUrl.pathname === pathname && targetUrl.search === window.location.search;
                const opensInNewTab = anchor.target === '_blank';

                if (!isExternal && !isSamePageNav && !opensInNewTab) {
                    setIsLoading(true);
                }
            }
        };

        document.addEventListener('click', handleAnchorClick);
        return () => document.removeEventListener('click', handleAnchorClick);
    }, [pathname]);

    const isAdminPage = pathname.startsWith('/admin');

    return (
        <>
            {isLoading && !isAdminPage && (
                <div
                    className={cn(
                        'fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500',
                        isFadingOut ? 'opacity-0' : 'opacity-100'
                    )}
                >
                    <PreLoader />
                </div>
            )}
            {children}
        </>
    );
}
