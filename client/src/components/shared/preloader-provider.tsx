
'use client';

import { usePathname } from 'next/navigation';
import { PreLoader } from './pre-loader';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useScroll } from '@/contexts/scroll-context';

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const isInitialLoad = useRef(true);
    const { scrollableElement } = useScroll();

    // This effect handles the visibility of the preloader.
    useEffect(() => {
        if (isInitialLoad.current) {
            setIsLoading(true);
        }
        
        const delay = isInitialLoad.current ? 650 : 350;
        
        const timer = setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
                setIsLoading(false);
                setIsFadingOut(false);
                if (isInitialLoad.current) {
                    isInitialLoad.current = false;
                }
                if (scrollableElement) {
                    scrollableElement.scrollTo({ top: 0, behavior: 'instant' });
                }
            }, 450);
        }, delay);
        
        return () => clearTimeout(timer);
    }, [pathname, scrollableElement]);

    // This effect adds a click listener to show the preloader on navigation.
    useEffect(() => {
        const handleAnchorClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const anchor = target.closest('a') as HTMLAnchorElement | null;

            if (anchor && anchor.href) {
                const hrefAttr = anchor.getAttribute('href') || '';
                // Ignore hash/anchor links on the same page (#tours, #inquiry, etc.)
                if (hrefAttr.startsWith('#')) return;

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
    }, [pathname]);

    const isAdminPage = pathname.startsWith('/admin');

    return (
        <>
            {/* Top Navigation Progress Indicator */}
            {isLoading && !isAdminPage && (
                <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[110] overflow-hidden bg-primary/20">
                    <div className="h-full w-full bg-gradient-to-r from-primary via-amber-300 to-primary animate-pulse" />
                </div>
            )}

            {/* Full-screen Luxury Emblem Preloader */}
            {isLoading && !isAdminPage && (
                <div
                    className={cn(
                        'fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-400',
                        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
                    )}
                >
                    <PreLoader />
                </div>
            )}
            {children}
        </>
    );
}
