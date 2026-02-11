
'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero-section';
import { DiscoverSection } from '@/components/sections/discover-section';
import { ToursSection } from '@/components/sections/tours-section';
import { ExploreRatnapuraSection } from '@/components/sections/explore-ratnapura-section';
import { BookingSection } from '@/components/sections/booking-section';
import { SubscriptionSection } from '@/components/sections/subscription-section';
import { useScroll } from '@/contexts/scroll-context';
import { useEffect, useRef } from 'react';

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);
  const { setScrollableElement } = useScroll();

  useEffect(() => {
    if (mainRef.current) {
      setScrollableElement(mainRef.current);
    }
  }, [setScrollableElement]);

  return (
    <div className="bg-background flex flex-col h-screen">
      <Header />
      <main ref={mainRef} className="flex-1 overflow-y-scroll">
        <HeroSection />
        <DiscoverSection />
        <ToursSection />
        <SubscriptionSection />
        <ExploreRatnapuraSection />
        <BookingSection />
        <Footer />
      </main>
    </div>
  );
}
