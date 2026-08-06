
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import useEmblaCarousel from 'embla-carousel-react';
import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { mapServerPackageToClient, type TourPackage } from '@/lib/packages-data';

import { API_BASE_URL } from '@/lib/utils';

const TourCard = ({ tour }: { tour: TourPackage }) => (
  <Card className="bg-card border-border/50 flex flex-col w-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 rounded-xl overflow-hidden">
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
      <h3 className="text-xl font-headline font-bold text-primary mb-4">{tour.homepageTitle}</h3>
      <p className="text-muted-foreground mb-6 flex-grow line-clamp-2">{tour.homepageDescription}</p>
      <div className="flex justify-between items-center mt-auto pt-4 border-t border-border">
          <div className="flex flex-col items-start">
            <span className="text-2xl font-bold text-primary">{tour.price}</span>
            <span className="text-sm font-normal text-muted-foreground -mt-1">{tour.priceSuffix}</span>
          </div>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
            <Link href={`/tours/${tour.slug}`}>
              <ArrowRight className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </Button>
      </div>
    </CardContent>
  </Card>
);

export function ToursSection() {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' });
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

  return (
    <section id="tours" className="w-full bg-background-alt py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <ScrollAnimate className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl">
                Our Exclusive Gem Mining Tour Packages
            </h2>
        </ScrollAnimate>
        <ScrollAnimate>
          {/* Desktop view */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {tours.map((tour, index) => (
              <TourCard key={index} tour={tour} />
            ))}
          </div>

          {/* Mobile view swiper */}
          <div className="md:hidden relative">
             <div className="overflow-hidden -ml-4" ref={emblaRef}>
              <div className="flex">
                {tours.map((tour, index) => (
                  <div className="relative flex-[0_0_85%] min-w-0 pl-4" key={index}>
                    <TourCard tour={tour} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollAnimate>
      </div>
    </section>
  );
}
