import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero-section';
import { DiscoverSection } from '@/components/sections/discover-section';
import { ToursSection } from '@/components/sections/tours-section';
import { ExploreRatnapuraSection } from '@/components/sections/explore-ratnapura-section';
import { BookingSection } from '@/components/sections/booking-section';
import { SubscriptionSection } from '@/components/sections/subscription-section';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <SubscriptionSection />
        <DiscoverSection />
        <ToursSection />
        <ExploreRatnapuraSection />
        <BookingSection />
      </main>
      <Footer />
    </div>
  );
}
