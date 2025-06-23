import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { locationsData } from '@/lib/locations-data';
import { LocationHero } from '@/components/sections/location-hero';
import { LocationIntro } from '@/components/sections/location-intro';
import { LocationGallery } from '@/components/sections/location-gallery';
import { LocationHighlights } from '@/components/sections/location-highlights';
import { LocationVisitorInfo } from '@/components/sections/location-visitor-info';
import { LocationNearby } from '@/components/sections/location-nearby';
import { LocationCta } from '@/components/sections/location-cta';

export default function LocationPage({ params }: { params: { slug: string } }) {
  const location = locationsData.find((loc) => loc.slug === params.slug);

  if (!location) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <LocationHero
          title={location.title}
          subtitle={location.subtitle}
          imageUrl={location.heroImage}
          imageHint={location.heroImageHint}
        />
        <LocationIntro
          distance={location.distance}
          title={location.intro.title}
          description={location.intro.description}
          imageUrl={location.intro.imageUrl}
          imageHint={location.intro.imageHint}
        />
        <LocationGallery images={location.galleryImages} />
        <LocationHighlights highlights={location.highlights} />
        <LocationVisitorInfo visitorInfo={location.visitorInfo} />
        <LocationNearby
          mapImage={location.map.image}
          mapImageHint={location.map.hint}
          nearbyAttractions={location.map.nearbyAttractions}
        />
        <LocationCta />
      </main>
      <Footer />
    </div>
  );
}