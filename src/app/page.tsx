import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero-section';
import { DiscoverSection } from '@/components/sections/discover-section';
import { ToursSection } from '@/components/sections/tours-section';
import { ExploreRatnapuraSection } from '@/components/sections/explore-ratnapura-section';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <DiscoverSection />
        <ToursSection />
        <ExploreRatnapuraSection />
      </main>
      <Footer />
    </div>
  );
}
