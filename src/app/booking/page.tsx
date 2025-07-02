

'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BookingHero } from '@/components/sections/booking-hero';
import { BookingForm } from '@/components/sections/booking-form';
import { Suspense, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';

function BookingContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && !user) {
      const tourType = searchParams.get('tourType');
      const destination = tourType ? `/auth?redirect=/booking?tourType=${encodeURIComponent(tourType)}` : '/auth?redirect=/booking';
      router.push(destination);
    }
  }, [user, isLoading, router, searchParams]);

  if (isLoading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <BookingHero />
      <Suspense fallback={
        <div className="flex items-center justify-center py-32">
          <p>Loading Form...</p>
        </div>
      }>
        <BookingForm />
      </Suspense>
    </>
  );
}


export default function BookingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center">
            <p>Loading...</p>
          </div>
        }>
          <BookingContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
