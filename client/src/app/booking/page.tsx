
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BookingPageContent } from '@/components/sections/booking-page-content';
import { TrustSection } from '@/components/sections/TrustSection';
import { fetchTourPackages } from '@/lib/packages-data';

export const revalidate = 3600;

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

function BookingPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl animate-pulse font-sans">
      <div className="space-y-2 mb-8">
        <div className="h-8 bg-muted/60 rounded-md w-72 max-w-full" />
        <div className="h-4 bg-muted/40 rounded-md w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-48 bg-muted/40 rounded-2xl" />
          <div className="h-96 bg-muted/30 rounded-2xl" />
        </div>
        <div className="h-80 bg-muted/40 rounded-2xl" />
      </div>
    </div>
  );
}

export default async function BookingPage() {
  const initialPackages = await fetchTourPackages(3600);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={<BookingPageSkeleton />}>
          <BookingPageContent initialPackages={initialPackages} />
        </Suspense>
      </main>
      <TrustSection />
      <Footer />
    </div>
  );
}

