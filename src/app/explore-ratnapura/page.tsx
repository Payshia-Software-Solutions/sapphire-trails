import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ExploreRatnapuraHero } from '@/components/sections/explore-ratnapura-hero';
import { ExploreRatnapuraContent } from '@/components/sections/explore-ratnapura-content';
import { ExploreMap } from '@/components/sections/explore-map';

export default function ExploreRatnapuraPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 bg-background-alt">
        <ExploreRatnapuraHero />
        <ExploreRatnapuraContent />
        <ExploreMap />
      </main>
      <Footer />
    </div>
  );
}
