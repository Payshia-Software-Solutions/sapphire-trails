"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import useEmblaCarousel from 'embla-carousel-react';
import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const gallery = [
  {
    src: 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp',
    alt: 'A collection of colorful polished gemstones.',
    hint: 'polished gemstones',
  },
  {
    src: 'https://content-provider.payshia.com/sapphire-trail/images/img34.webp',
    alt: 'A hand holding several large, uncut gemstones.',
    hint: 'uncut gemstones',
  },
  {
    src: 'https://content-provider.payshia.com/sapphire-trail/images/img29.webp',
    alt: 'A wide view of a beautiful cascading waterfall in a lush jungle.',
    hint: 'waterfall jungle',
  },
];

export function ExploreRatnapuraSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi]);

  return (
    <section id="ratnapura" className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6">
        <ScrollAnimate className="flex flex-col items-center text-center space-y-8">
          <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl">
            Explore Ratnapura
          </h2>

          {/* Desktop view */}
          <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {gallery.map((image, index) => (
              <div key={index} className="overflow-hidden rounded-xl">
                <Image
                  src={image.src}
                  alt={image.alt}
                  data-ai-hint={image.hint}
                  width={600}
                  height={400}
                  className="object-cover w-full h-full transform transition-transform duration-500 hover:scale-110"
                />
              </div>
            ))}
          </div>
          
          {/* Mobile view swiper */}
          <div className="sm:hidden w-full relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex -ml-4">
                {gallery.map((image, index) => (
                  <div className="flex-grow-0 flex-shrink-0 basis-full min-w-0 pl-4" key={index}>
                    <div className="overflow-hidden rounded-xl">
                       <Image
                        src={image.src}
                        alt={image.alt}
                        data-ai-hint={image.hint}
                        width={600}
                        height={400}
                        className="object-cover w-full h-auto"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={scrollPrev} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 p-0 bg-background/50 hover:bg-background/80 border-0 text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button onClick={scrollNext} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 p-0 bg-background/50 hover:bg-background/80 border-0 text-foreground">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-w-3xl">
            <p className="text-lg text-muted-foreground">
              From waterfalls to ancient temples and vibrant bazaars, Ratnapura is a treasure trove for explorers. Discover what makes this region truly shine.
            </p>
          </div>

          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/booking">Book Now</Link>
          </Button>
        </ScrollAnimate>
      </div>
    </section>
  );
}
