import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero-section';
import { DiscoverSection } from '@/components/sections/discover-section';
import { ToursSection } from '@/components/sections/tours-section';
import { ExploreRatnapuraSection } from '@/components/sections/explore-ratnapura-section';
import { BookingSection } from '@/components/sections/booking-section';
import { SubscriptionSection } from '@/components/sections/subscription-section';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sapphire Trails | Luxury Gem Tours in Sri Lanka',
  description: "Experience Sri Lanka's only luxury gem tour. Discover the heart of Ratnapura's rich heritage with exclusive access to gem mines, lush tea estates, and vibrant local culture.",
   openGraph: {
    title: 'Sapphire Trails | Luxury Gem Tours in Sri Lanka',
    description: "Sri Lanka's only luxury gem experience.",
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
      width: 1200,
      height: 630,
      alt: 'A dark and moody image of the inside of a gem mine.'
    }],
  }
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <DiscoverSection />
        <ToursSection />
        <SubscriptionSection />
        <ExploreRatnapuraSection />
        <BookingSection />
      </main>
      <Footer />
    </div>
  );
}
