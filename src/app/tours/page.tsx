'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ToursHero } from '@/components/sections/tours-hero';
import { TourCards } from '@/components/sections/tour-cards';
import { ComparisonTable } from '@/components/sections/comparison-table';
import { Faq } from '@/components/sections/faq';

function PageContent() {
  const searchParams = useSearchParams();
  const selectedTour = searchParams.get('selected') as string | null;

  return (
    <>
      <ToursHero />
      <TourCards selectedTour={selectedTour} />
      <ComparisonTable selectedTour={selectedTour} />
      <Faq />
    </>
  );
}

export default function ToursPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 bg-background-alt">
        <Suspense fallback={
          <div className="flex items-center justify-center h-[50vh]">
            <p>Loading Tours...</p>
          </div>
        }>
          <PageContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
