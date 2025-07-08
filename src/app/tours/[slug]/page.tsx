
'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { mapServerPackageToClient, type TourPackage } from '@/lib/packages-data';
import { Skeleton } from '@/components/ui/skeleton';
import { TourDetailHero } from '@/components/sections/tour-detail-hero';
import { TourDetailHighlights } from '@/components/sections/tour-detail-highlights';
import { TourDetailInclusions } from '@/components/sections/tour-detail-inclusions';
import { BookingSection } from '@/components/sections/booking-section';
import { TourDetailItinerary } from '@/components/sections/tour-detail-itinerary';


function LoadingSkeleton() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1">
                <div className="flex flex-col gap-8">
                    <Skeleton className="h-[60vh] w-full" />
                    <div className="container mx-auto px-4 md:px-6 space-y-8 py-12">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default function TourDetailPage() {
  const params = useParams<{ slug: string }>();
  const [tourPackage, setTourPackage] = useState<TourPackage | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!params.slug) return;

    async function fetchTourPackage() {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost/sapphire_trails_server/tours/${params.slug}`);
            if (!response.ok) {
                // If not found or any other error, set to undefined to trigger notFound()
                setTourPackage(undefined);
                return;
            }
            const data = await response.json();
            const mappedPackage = mapServerPackageToClient(data);
            setTourPackage(mappedPackage);
        } catch (error) {
            console.error("Failed to fetch tour package", error);
            setTourPackage(undefined);
        } finally {
            setIsLoading(false);
        }
    }

    fetchTourPackage();
  }, [params.slug]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!tourPackage) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <TourDetailHero
            title={tourPackage.tourPageTitle}
            duration={tourPackage.duration}
            price={tourPackage.price}
            imageUrl={tourPackage.heroImage}
            imageHint={tourPackage.heroImageHint}
            bookingLink={`${tourPackage.bookingLink}?tourType=${tourPackage.id}`}
        />
        <TourDetailHighlights 
            description={tourPackage.tourPageDescription}
            highlights={tourPackage.tourHighlights}
        />
        <TourDetailItinerary itinerary={tourPackage.itinerary} />
        <TourDetailInclusions
            inclusions={tourPackage.inclusions}
        />
        <BookingSection />
      </main>
      <Footer />
    </div>
  );
}
