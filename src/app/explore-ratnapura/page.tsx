
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ExploreRatnapuraContent } from '@/components/sections/explore-ratnapura-content';
import { ExploreMap } from '@/components/sections/explore-map';
import type { Metadata } from 'next';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import { PageHero } from '@/components/shared/page-hero';
import { TrustSection } from '@/components/sections/TrustSection';

export const metadata: Metadata = {
  title: 'Explore Ratnapura Attractions on Your Gem Tour | Sapphire Trails',
  description: 'Discover what to do in Ratnapura on your Sri Lanka gem tour. Explore attractions near the gem mines, from the famous gem market to ancient temples. Plan your visit with Sapphire Trails.',
  openGraph: {
    title: 'Explore Ratnapura Attractions | Gem Tours Sri Lanka',
    description: 'Discover the rich culture and natural beauty of Sri Lanka\'s gem capital, including the famous Ratnapura gem market.',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp',
      width: 1200,
      height: 630,
      alt: 'A collection of colorful polished gemstones from a Ratnapura gem tour.'
    }],
  }
};

export default function ExploreRatnapuraPage() {
  const breadcrumbs = [{ label: 'Explore Ratnapura', href: '/explore-ratnapura' }];
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <PageHero title="Explore Ratnapura" breadcrumbs={breadcrumbs} />
        <div className="bg-background-alt">
          <ScrollAnimate>
            <ExploreRatnapuraContent />
          </ScrollAnimate>
        </div>
        <div className="bg-background">
          <ScrollAnimate>
            <ExploreMap />
          </ScrollAnimate>
        </div>
      </main>
      <TrustSection />
      <Footer />
    </div>
  );
}
