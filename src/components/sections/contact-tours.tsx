
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mapServerPackageToClient, type TourPackage } from '@/lib/packages-data';
import { CalendarCheck } from 'lucide-react';

const API_BASE_URL = 'https://server-sapphiretrails.payshia.com';

const TourCard = ({ tour }: { tour: TourPackage }) => (
    <Card className="bg-card border-stone-800/50 flex flex-col w-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 rounded-xl overflow-hidden">
      <Link href={`/tours/${tour.slug}`} className="block group">
          <div className="relative h-40 w-full">
          <Image
              src={tour.imageUrl}
              alt={tour.imageAlt}
              data-ai-hint={tour.imageHint}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          </div>
      </Link>
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-headline font-bold text-primary mb-2 flex-grow">
          <Link href={`/tours/${tour.slug}`}>{tour.homepageTitle}</Link>
        </h3>
        <div className="flex items-center justify-between gap-4 mt-auto">
          <p className="text-lg font-bold text-primary">{tour.price}</p>
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4">
            <Link href={`/booking?tourType=${tour.id}`}>
              <CalendarCheck className="mr-2 h-4 w-4" />
              Book
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

export function ContactTours() {
    const [tours, setTours] = useState<TourPackage[]>([]);

    useEffect(() => {
        async function fetchTours() {
            try {
                const response = await fetch(`${API_BASE_URL}/tours`);
                if (!response.ok) {
                    console.error('Failed to fetch tours from server.');
                    return;
                }
                const data = await response.json();
                if (Array.isArray(data)) {
                    setTours(data.map(mapServerPackageToClient));
                }
            } catch (e) {
                console.error("Failed to fetch or parse packages.", e);
            }
        }
        fetchTours();
    }, []);

    if (tours.length === 0) return null;

    return (
        <section className="w-full py-12 md:py-24 bg-background-alt">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl">
                        Our Tour Packages
                    </h2>
                    <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
                        Ready for an adventure? Choose your perfect gem tour experience and book now.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {tours.map((tour) => (
                        <TourCard key={tour.id} tour={tour} />
                    ))}
                </div>
            </div>
        </section>
    )
}
