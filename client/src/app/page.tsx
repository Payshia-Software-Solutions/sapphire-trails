'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero-section';
import { TrustSection } from '@/components/sections/TrustSection';
import { DiscoverSection } from '@/components/sections/discover-section';
import { StatsSection } from '@/components/sections/stats-section';
import { ToursSection } from '@/components/sections/tours-section';
import { ExploreRatnapuraSection } from '@/components/sections/explore-ratnapura-section';
import { ArticlesSection } from '@/components/sections/articles-section';
import { SubscriptionSection } from '@/components/sections/subscription-section';

export default function Home() {
  return (
    <div className="bg-background flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <DiscoverSection />
        <StatsSection />
        <ToursSection />
        <ExploreRatnapuraSection />
        <ArticlesSection />
        <SubscriptionSection />
      </main>
      <TrustSection />
      <Footer />
    </div>
  );
}
