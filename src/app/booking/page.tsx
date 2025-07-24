
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BookingPageContent } from '@/components/sections/booking-page-content';

export const metadata: Metadata = {
  title: 'Book Your Tour',
  description: 'Select your tour package, date, and number of guests to reserve your spot on an unforgettable adventure with Sapphire Trails.',
  openGraph: {
    title: 'Book Your Sapphire Trails Adventure',
    description: 'Complete your booking for a luxury gem tour in Sri Lanka.',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img4.webp',
      width: 1200,
      height: 630,
      alt: 'An overhead view of someone sifting for gems.'
    }],
  }
};

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
          <BookingPageContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
