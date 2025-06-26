
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is deprecated and redirects to the main booking requests list.
export default function DeprecatedEditBookingPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/admin/booking-requests');
    }, [router]);

    return null;
}
