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

    // This effect is responsible for HIDING the preloader.
    // It is triggered whenever the page's path changes.
    useEffect(() => {
        // For the very first page load, we want a minimum display time for a good first impression.
        // For subsequent page loads, we hide it much faster.
        const delay = isInitialLoad.current ? 1000 : 200;
        
        const timer = setTimeout(() => {
            setIsFadingOut(true); // Start the fade-out animation
            setTimeout(() => {
                setIsLoading(false); // Remove the preloader from the DOM
                setIsFadingOut(false);
                if (isInitialLoad.current) {
                    isInitialLoad.current = false; // After the first load, subsequent loads are faster.
                }
            }, 500); // This duration must match the CSS transition time
        }, delay);
        
        return () => clearTimeout(timer);
    }, [pathname]);

    // This effect is responsible for SHOWING the preloader.
    // It adds a click listener to the whole document.
    useEffect(() => {
        const handleAnchorClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const anchor = target.closest('a');

            if (anchor && anchor.href) {
                const targetUrl = new URL(anchor.href, window.location.origin);
                const isExternal = targetUrl.origin !== window.location.origin;
                const isSamePageNav = targetUrl.pathname === pathname && targetUrl.search === window.location.search;
                const opensInNewTab = anchor.target === '_blank';

                // If it's an internal link for navigation, show the preloader.
                if (!isExternal && !isSamePageNav && !opensInNewTab) {
                    setIsLoading(true);
                }
            }
        };

        document.addEventListener('click', handleAnchorClick);
        return () => document.removeEventListener('click', handleAnchorClick);
    }, [pathname]); // Re-add the listener if the path changes to get the correct current 'pathname'.

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
