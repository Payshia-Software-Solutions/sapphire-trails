
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mapServerPackageToClient, type TourPackage } from '@/lib/packages-data';
import { CalendarCheck } from 'lucide-react';

import { API_BASE_URL } from '@/lib/utils';

const TourCard = ({ tour }: { tour: TourPackage }) => (
    <Card className="bg-card border border-border/80 flex flex-col w-full rounded-2xl overflow-hidden hover:border-[#0B1E38]/30 dark:hover:border-blue-500/40 transition-colors shadow-sm group">
      <Link href={`/tours/${tour.slug}`} className="block">
          <div className="relative h-44 w-full overflow-hidden">
          <Image
              src={tour.imageUrl}
              alt={tour.imageAlt}
              data-ai-hint={tour.imageHint}
              fill
              className="object-cover md:group-hover:scale-105 transition-transform duration-500"
          />
          </div>
      </Link>
      <CardContent className="p-5 flex flex-col flex-grow">
        <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-[#0B1E38] dark:group-hover:text-blue-400 mb-2 flex-grow transition-colors line-clamp-2">
          <Link href={`/tours/${tour.slug}`}>{tour.homepageTitle}</Link>
        </h3>
        <div className="flex items-center justify-between gap-4 mt-auto pt-3 border-t border-border/60">
          <p className="text-lg font-bold text-[#0B1E38] dark:text-blue-400">{tour.price}</p>
          <Button asChild size="sm" className="bg-[#0B1E38] hover:bg-[#071527] text-white rounded-full px-5 h-9 text-xs font-medium shadow-sm">
            <Link href={`/tours/${tour.slug}/book`}>
              <CalendarCheck className="mr-1.5 h-3.5 w-3.5" />
              Book Now
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
        <section className="w-full py-16 md:py-24 bg-background-alt">
            <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0B1E38]/80 dark:text-blue-400">
                      Signature Expeditions
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
                        Our Tour Packages
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
                        Ready for an adventure? Choose your perfect gem tour experience and book now.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                     {tours.map((tour) => (
                        <TourCard key={tour.id} tour={tour} />
                    ))}
                </div>
            </div>
        </section>
    )
}
