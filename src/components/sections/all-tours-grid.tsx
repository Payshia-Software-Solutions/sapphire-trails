
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mapServerPackageToClient, type TourPackage } from '@/lib/packages-data';

const API_BASE_URL = 'https://server-sapphiretrails.payshia.com';

const TourCard = ({ tour }: { tour: TourPackage }) => (
  <Card className="bg-card border-stone-800/50 flex flex-col w-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 rounded-xl overflow-hidden">
    <div className="relative h-64 w-full">
      <Image
        src={tour.imageUrl}
        alt={tour.imageAlt}
        data-ai-hint={tour.imageHint}
        fill
        className="object-cover"
      />
    </div>
    <CardContent className="p-8 flex flex-col flex-grow">
      <h3 className="text-2xl font-headline font-bold text-primary mb-4">{tour.homepageTitle}</h3>
      <p className="text-muted-foreground mb-6 flex-grow">{tour.homepageDescription}</p>
      <div className="flex items-center gap-4 mt-auto">
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
          <Link href={`/booking?tourType=${tour.id}`}>Book Now</Link>
        </Button>
        <Button asChild variant="outline" className="text-primary border-primary hover:bg-primary/10 hover:text-primary rounded-full px-6">
            <Link href={`/tours/${tour.slug}`}>More Info</Link>
        </Button>
      </div>
    </CardContent>
  </Card>
);

export function AllToursGrid() {
    const [allTours, setAllTours] = useState<TourPackage[]>([]);

    useEffect(() => {
        async function fetchTours() {
            try {
                const response = await fetch(`${API_BASE_URL}/tours`);
                 if (!response.ok) {
                    console.error('Failed to fetch from server.');
                    return;
                }

                const data = await response.json();
                if (Array.isArray(data)) {
                    setAllTours(data.map(mapServerPackageToClient));
                } else {
                    console.error('Server response was not an array.');
                }
            } catch (e) {
                console.error("Failed to fetch or parse packages.", e);
            }
        }
        fetchTours();
    }, []);

    return (
        <section className="w-full py-12 md:py-24 bg-background-alt">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
                    {allTours.map((tour) => (
                        <TourCard key={tour.id} tour={tour} />
                    ))}
                </div>
            </div>
        </section>
    )
}
