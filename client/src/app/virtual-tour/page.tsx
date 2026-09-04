
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { VirtualTourContent } from '@/components/sections/virtual-tour-content';
import type { Metadata } from 'next';
import { PageHero } from '@/components/shared/page-hero';
import { TrustSection } from '@/components/sections/TrustSection';

export const metadata: Metadata = {
  title: 'Virtual Gem Tour of a Ratnapura Mine | Sri Lanka',
  description: 'Experience the thrill of a Sri Lankan gem mine from anywhere with our Ratnapura virtual gem tour. Coming soon from Sapphire Trails.',
  openGraph: {
    title: 'Virtual Gem Tour of a Sri Lankan Gem Mine in Ratnapura',
    description: 'Coming soon: an immersive 360-degree virtual tour experience from Sapphire Trails.',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
      width: 1200,
      height: 630,
      alt: 'A dark and moody image of the inside of a gem mine.'
    }],
  }
};


export default function VirtualTourPage() {
  const breadcrumbs = [{ label: 'Virtual Tour', href: '/virtual-tour' }];
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 bg-background-alt">
        <PageHero title="Virtual Tour" breadcrumbs={breadcrumbs} />
        <VirtualTourContent />
      </main>
      <TrustSection />
      <Footer />
    </div>
  );
}
