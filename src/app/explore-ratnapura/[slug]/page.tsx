'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { locationsData as staticLocationsData, mapServerLocationToClient, type Location } from '@/lib/locations-data';
import { LocationHero } from '@/components/sections/location-hero';
import { LocationIntro } from '@/components/sections/location-intro';
import { LocationGallery } from '@/components/sections/location-gallery';
import { LocationHighlights } from '@/components/sections/location-highlights';
import { LocationVisitorInfo } from '@/components/sections/location-visitor-info';
import { LocationNearby } from '@/components/sections/location-nearby';
import { LocationCta } from '@/components/sections/location-cta';
import { Skeleton } from '@/components/ui/skeleton';


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
    if (!params.slug) {
        setIsLoading(false);
        return;
    }

    async function fetchLocation() {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost/sapphire_trails_server/locations/${params.slug}`);
            if (response.ok) {
                const data = await response.json();
                const mappedLocation = mapServerLocationToClient(data);
                setLocation(mappedLocation);
            } else {
                // If not found on server, try finding in static data as a fallback
                const staticLocation = staticLocationsData.find(p => p.slug === params.slug);
                setLocation(staticLocation);
            }
        } catch (error) {
            console.error("Failed to fetch location", error);
            // On fetch error, also fallback to static data
            const staticLocation = staticLocationsData.find(p => p.slug === params.slug);
            setLocation(staticLocation);
        } finally {
            setIsLoading(false);
        }
    }

    fetchLocation();
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
