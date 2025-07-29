import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ExploreRatnapuraHero } from '@/components/sections/explore-ratnapura-hero';
import { ExploreRatnapuraContent } from '@/components/sections/explore-ratnapura-content';
import { ExploreMap } from '@/components/sections/explore-map';
import type { Metadata } from 'next';
import { ScrollAnimate } from '@/components/shared/scroll-animate';

export const metadata: Metadata = {
  title: 'Explore Ratnapura',
  description: 'Discover the natural wonders, cultural heritage, and agricultural landmarks of Ratnapura, the City of Gems. Plan your visit to waterfalls, temples, and more.',
  openGraph: {
    title: 'Explore Ratnapura with Sapphire Trails',
    description: 'Discover the rich culture and natural beauty of Sri Lanka\'s gem capital.',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp',
      width: 1200,
      height: 630,
      alt: 'A collection of colorful polished gemstones.'
    }],
  }
};

export default function ExploreRatnapuraPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 bg-background-alt">
        <ExploreRatnapuraHero />
        <ScrollAnimate>
          <ExploreRatnapuraContent />
        </ScrollAnimate>
        <ScrollAnimate>
          <ExploreMap />
        </ScrollAnimate>
      </main>
      <Footer />
    </div>
  );
}
