'use client';

import { usePathname } from 'next/navigation';
import { PreLoader } from './pre-loader';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);

    const hideLoader = useCallback(() => {
        if (isFadingOut) return;
        
        setIsFadingOut(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsFadingOut(false);
        }, 500); // CSS transition duration
    }, [isFadingOut]);

    // Initial load effect
    useEffect(() => {
        const timer = setTimeout(() => {
            hideLoader();
        }, 1000);
        return () => clearTimeout(timer);
    }, [hideLoader]);

    // Route change effect
    useEffect(() => {
        // When path changes, hide the loader if it's currently showing
        if (isLoading && !isFadingOut) {
            hideLoader();
        }

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
                    setIsFadingOut(false);
                }
            }
        };

        document.addEventListener('click', handleAnchorClick);
        return () => document.removeEventListener('click', handleAnchorClick);
    }, [pathname, isLoading, isFadingOut, hideLoader]);

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
