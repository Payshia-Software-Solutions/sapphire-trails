
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import useEmblaCarousel from 'embla-carousel-react';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { mapServerPackageToClient, type TourPackage } from '@/lib/packages-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
      <div className="flex justify-between items-center mt-auto pt-4 border-t border-border">
          <p className="text-2xl font-bold text-primary">{tour.price} <span className="text-sm font-normal text-muted-foreground">{tour.priceSuffix}</span></p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
            <Link href={`/tours/${tour.slug}`}>More Info</Link>
          </Button>
      </div>
    </CardContent>
  </Card>
);

export function ToursSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [tours, setTours] = useState<TourPackage[]>([]);

  useEffect(() => {
    async function fetchTours() {
      try {
        const response = await fetch(`${API_BASE_URL}/tours`);
        if (!response.ok) {
            console.error("Failed to fetch tour packages.");
            return;
        }
        
        const data = await response.json();
        if (Array.isArray(data)) {
            const serverPackages = data.map(mapServerPackageToClient);
            setTours(serverPackages);
        } else {
            console.error("Server response was not an array.");
        }
      } catch (e) {
        console.error("Failed to fetch or parse packages.", e);
      }
    }
    fetchTours();
  }, []);
  
  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi]);

  return (
    <section id="tours" className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <ScrollAnimate>
          {/* Desktop view */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {tours.map((tour, index) => (
              <TourCard key={index} tour={tour} />
            ))}
          </div>

          {/* Mobile view swiper */}
          <div className="md:hidden relative">
             <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {tours.map((tour, index) => (
                  <div className="relative flex-[0_0_100%] min-w-0 p-2" key={index}>
                    <TourCard tour={tour} />
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={scrollPrev} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 p-0 z-10 bg-background/50 hover:bg-background/80 border-0 text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button onClick={scrollNext} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 p-0 z-10 bg-background/50 hover:bg-background/80 border-0 text-foreground">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </ScrollAnimate>
      </div>
    </section>
  );
}
