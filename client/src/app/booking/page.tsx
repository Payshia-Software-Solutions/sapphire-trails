
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BookingPageContent } from '@/components/sections/booking-page-content';
import { TrustSection } from '@/components/sections/TrustSection';

export const metadata: Metadata = {
  title: 'Book Your Gem Tour Adventure in Sri Lanka | Sapphire Trails',
  description: 'Book your gem tour adventure in Ratnapura, Sri Lanka. Select your gem tour package and reserve your unforgettable gem experience with Sapphire Trails.',
  alternates: {
    canonical: '/booking',
  },
  openGraph: {
    title: 'Book Your Sapphire Trails Gem Tour Adventure',
    description: 'Complete your booking for a premier gem tour and gem experience in Ratnapura, Sri Lanka.',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img4.webp',
      width: 1200,
      height: 630,
      alt: 'An overhead view of someone sifting for gems on a Sri Lankan gem tour.'
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
      <TrustSection />
      <Footer />
    </div>
  );
}
