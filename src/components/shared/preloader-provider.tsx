
'use client';

import { usePathname } from 'next/navigation';
import { PreLoader } from './pre-loader';
import { useState, useEffect } from 'react';

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        // This effect runs only once on the client, after the initial render.
        setIsInitialLoad(false);
    }, []);

    const isAdminPage = pathname.startsWith('/admin');
    
    // Only show the preloader on the very first load, and only if it's not an admin page.
    const showPreloader = isInitialLoad && !isAdminPage;

    return (
        <>
            {showPreloader && <PreLoader />}
            {children}
        </>
    );
}
