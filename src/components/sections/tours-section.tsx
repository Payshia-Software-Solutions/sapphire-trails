"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import useEmblaCarousel from 'embla-carousel-react';
import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const tours = [
  {
    id: 'gem-explorer-day-tour',
    title: 'Exclusive Sapphire Mine Tour with Hands-On Discovery',
    description: "Dive deep into the world of gem mining with expert guides. Discover the secrets behind Sri Lanka's most precious sapphires and immerse yourself in authentic local traditions.",
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img4.webp',
    imageHint: 'tourists mining',
    alt: 'A group of smiling tourists wearing hard hats on a sapphire mine tour.'
  },
  {
    id: 'sapphire-trails-deluxe',
    title: 'Tea Estate & Luxury Dining',
    description: 'Savor the flavors of Sri Lanka with a private tour of a lush tea estate, followed by a curated gourmet dining experience in an elegant setting surrounded by nature.',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img5.webp',
    imageHint: 'luxury gem logo',
    alt: 'The logo for Sapphire Trails Deluxe tours.'
  }
];

const TourCard = ({ tour }: { tour: typeof tours[0] }) => (
  <Card className="bg-card border-stone-800/50 flex flex-col w-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 rounded-xl overflow-hidden">
    <div className="relative h-64 w-full">
      <Image
        src={tour.imageUrl}
        alt={tour.alt}
        data-ai-hint={tour.imageHint}
        fill
        className="object-cover"
      />
    </div>
    <CardContent className="p-8 flex flex-col flex-grow">
      <h3 className="text-2xl font-headline font-bold text-primary mb-4">{tour.title}</h3>
      <p className="text-muted-foreground mb-6 flex-grow">{tour.description}</p>
      <Button asChild className="w-fit bg-primary text-primary-foreground hover:bg-primary/90 mt-auto rounded-full px-6">
        <Link href={`/tours?selected=${tour.id}`}>More Info</Link>
      </Button>
    </CardContent>
  </Card>
);


export function ToursSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  
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
              <div className="flex -ml-4">
                {tours.map((tour, index) => (
                  <div className="flex-grow-0 flex-shrink-0 basis-full min-w-0 pl-4" key={index}>
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
