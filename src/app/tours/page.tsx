
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Faq } from '@/components/sections/faq';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import { PageHero } from '@/components/shared/page-hero';
import type { Metadata } from 'next';
import { AllToursGrid } from '@/components/sections/all-tours-grid';

export const metadata: Metadata = {
  title: 'Our Tours',
  description: 'Explore our exclusive luxury gem tour packages. From day trips to deluxe multi-day experiences, discover the heart of Sri Lanka\'s gem country with Sapphire Trails.',
  openGraph: {
    title: 'Our Luxury Gem Tours | Sapphire Trails',
    description: 'Choose your perfect Sri Lankan gem adventure.',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img4.webp',
      width: 1200,
      height: 630,
      alt: 'A person sifting for gems in a river.',
    }],
  },
};

export default function ToursPage() {
  const breadcrumbs = [{ label: 'Tours', href: '/tours' }];
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PageHero title="Our Tours" breadcrumbs={breadcrumbs} />
        <ScrollAnimate>
          <AllToursGrid />
        </ScrollAnimate>
        <ScrollAnimate>
          <Faq />
        </ScrollAnimate>
      </main>
      <Footer />
    </div>
  );
}
