
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Gem, Landmark, Award, Utensils, Star, Package, Coffee, BedDouble, Leaf, Mountain, Bird, Home, Clock, CalendarDays, Ticket, Users, AlertTriangle, Waves, Camera, Tent, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { initialTourPackages, type TourPackage } from '@/lib/packages-data';
import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';

const iconMap: { [key: string]: LucideIcon } = {
  MapPin, Gem, Landmark, Award, Utensils, Star, Package, Coffee, BedDouble, Leaf, Mountain, Bird, Home, Clock, CalendarDays, Ticket, Users, AlertTriangle, Waves, Camera, Tent, Thermometer
};


const mapFeatures = (features: any[]) => {
  return features.map(feature => {
    const IconComponent = iconMap[feature.icon as string] || Star;
    return { ...feature, icon: IconComponent };
  });
};

export function TourCards({ selectedTour }: { selectedTour: string | null }) {
  const [allTours, setAllTours] = useState<TourPackage[]>(initialTourPackages);

   useEffect(() => {
    const storedPackagesRaw = localStorage.getItem('customPackages');
    if (storedPackagesRaw) {
        try {
            const customPackages = JSON.parse(storedPackagesRaw) as any[];
            if (Array.isArray(customPackages)) {
                const mappedCustom = customPackages.map(pkg => ({
                  ...pkg,
                  features: mapFeatures(pkg.features)
                }));
                const combined = [...initialTourPackages, ...mappedCustom];

                const unique: { [key: string]: TourPackage } = {};
                for (const pkg of combined) {
                    unique[pkg.id] = pkg;
                }
                setAllTours(Object.values(unique));
            }
        } catch (e) {
            console.error("Failed to parse custom packages", e);
            setAllTours(initialTourPackages);
        }
    }
  }, []);

  const toursToShow = selectedTour
    ? allTours.filter(tour => tour.id === selectedTour)
    : allTours;

  const gridColsClass = toursToShow.length === 1 ? 'md:grid-cols-1 justify-center' : 'md:grid-cols-2';

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6">
        {toursToShow.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            <p className="text-lg">The selected tour package was not found.</p>
            <Button asChild variant="link" className="mt-4 text-lg text-primary">
              <Link href="/tours">View All Tours</Link>
            </Button>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${gridColsClass} gap-8 lg:gap-12 items-stretch max-w-5xl mx-auto`}>
            {toursToShow.map(tour => (
              <Card key={tour.id} className="bg-card border-stone-800/50 flex flex-col w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
                <div className="relative h-[400px] w-full">
                  <Image
                    src={tour.imageUrl}
                    alt={tour.imageAlt}
                    data-ai-hint={tour.imageHint}
                    fill
                    className="object-cover"
                  />
                  {tour.title && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center text-white font-headline w-full px-4">
                        <p className="text-sm tracking-[0.2em]">{tour.title.line1}</p>
                        <h3 className="text-6xl font-bold tracking-tight my-2">{tour.title.line2}</h3>
                        <p className="text-2xl tracking-[0.1em]">{tour.title.line3}</p>
                      </div>
                    </>
                  )}
                </div>
                <CardContent className="p-8 flex flex-col flex-grow">
                  <div className="space-y-3 flex-grow text-sm text-muted-foreground">
                    {tour.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <feature.icon className="h-4 w-4 mt-1 text-primary shrink-0" />
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
                    <p className="text-3xl font-bold text-primary">{tour.price} <span className="text-sm font-normal text-muted-foreground">{tour.priceSuffix}</span></p>
                    <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-8"><Link href={`${tour.bookingLink}?tourType=${tour.id}`}>{tour.id === 'sapphire-trails-deluxe' ? 'Contact Us' : 'Book Now'}</Link></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
