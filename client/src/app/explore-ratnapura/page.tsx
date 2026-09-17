
import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ExploreRatnapuraContent } from '@/components/sections/explore-ratnapura-content';
import { PageHero } from '@/components/shared/page-hero';
import { TrustSection } from '@/components/sections/TrustSection';
import { fetchLocationsServer } from '@/lib/locations-data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Explore Ratnapura | Waterfalls, Temples, Tea Estates & Gem Mines',
  description: 'Explore the top attractions in Ratnapura, Sri Lanka. Discover Bopath Ella Falls, Sinharaja Rainforest, Adam’s Peak trails, ancient temples, and tea estates.',
  alternates: {
    canonical: '/explore-ratnapura',
  },
  openGraph: {
    title: 'Explore Ratnapura | Waterfalls, Temples, Tea Estates & Gem Mines',
    description: 'A curated travel guide to Ratnapura and the Sabaragamuwa province with Sapphire Trails.',
    url: 'https://sapphiretrails.lk/explore-ratnapura',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp',
      width: 1200,
      height: 630,
      alt: 'Explore Ratnapura Attractions',
    }],
  },
};

export default async function ExploreRatnapuraPage() {
  const breadcrumbs = [{ label: 'Explore Ratnapura', href: '/explore-ratnapura' }];
  const initialLocations = await fetchLocationsServer(3600);

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <Header />
      <main className="flex-1">
        {/* 1. Hero Banner */}
        <PageHero 
          title="Explore Ratnapura" 
          badge="City of Gems Discovery Guide"
          subtitle="Discover ancient sapphire trading markets, revered temples, cascading waterfalls, and lush tea estates in the Sabaragamuwa province."
          breadcrumbs={breadcrumbs} 
          backgroundImage="https://content-provider.payshia.com/sapphire-trail/images/img33.webp"
        />

        {/* 2. Attractions Catalog Grid */}
        <div className="bg-background-alt">
          <ExploreRatnapuraContent initialLocations={initialLocations} />
        </div>
      </main>
      <TrustSection />
      <Footer />
    </div>
  );
}



