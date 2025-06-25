'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { locationsData as staticLocationsData, type Location } from '@/lib/locations-data';
import { LocationHero } from '@/components/sections/location-hero';
import { LocationIntro } from '@/components/sections/location-intro';
import { LocationGallery } from '@/components/sections/location-gallery';
import { LocationHighlights } from '@/components/sections/location-highlights';
import { LocationVisitorInfo } from '@/components/sections/location-visitor-info';
import { LocationNearby } from '@/components/sections/location-nearby';
import { LocationCta } from '@/components/sections/location-cta';
import { Skeleton } from '@/components/ui/skeleton';

const getAllLocations = (): Location[] => {
  let allLocations: Location[] = [...staticLocationsData];
  if (typeof window !== 'undefined') {
    const customLocationsRaw = localStorage.getItem('customLocations');
    if (customLocationsRaw) {
      try {
        const customLocations = JSON.parse(customLocationsRaw) as Location[];
        if (Array.isArray(customLocations)) {
          const combined = [...allLocations, ...customLocations];
          const unique: { [key: string]: Location } = {};
          for (const loc of combined) {
            unique[loc.slug] = loc;
          }
          allLocations = Object.values(unique);
        }
      } catch (e) {
        console.error("Failed to parse custom locations", e);
      }
    }
  }
  return allLocations;
};

function LoadingSkeleton() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1">
                <div className="flex flex-col gap-8 py-12">
                    <Skeleton className="h-[60vh] w-full" />
                    <div className="container mx-auto px-4 md:px-6 space-y-8">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default function LocationPage() {
  const params = useParams<{ slug: string }>();
  const [location, setLocation] = useState<Location | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const allLocations = getAllLocations();
    const foundLocation = allLocations.find((loc) => loc.slug === params.slug);
    setLocation(foundLocation);
    setIsLoading(false);
  }, [params.slug]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

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
          mapEmbedUrl={location.map.embedUrl}
          nearbyAttractions={location.map.nearbyAttractions}
        />
        <LocationCta />
      </main>
      <Footer />
    </div>
  );
}
