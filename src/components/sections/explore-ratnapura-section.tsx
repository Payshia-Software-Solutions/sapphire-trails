
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
    title: 'Sinharaja Rainforest',
    description: "Sinharaja Rainforest stands as Sri Lanka’s last viable area of primary tropical rainforest, harboring an extraordinary collection of endemic species.",
    slug: 'sinharaja-rainforest'
  },
  {
    src: 'https://content-provider.payshia.com/sapphire-trail/images/img34.webp',
    alt: 'A hand holding several large, uncut gemstones.',
    hint: 'uncut gemstones',
    title: 'Bopath Ella Falls',
    description: "Bopath Ella, named for its perfect resemblance to a leaf from the sacred Bo tree, is one of Sri Lanka's most iconic waterfalls.",
    slug: 'bopath-ella-falls'
  },
  {
    src: 'https://content-provider.payshia.com/sapphire-trail/images/img29.webp',
    alt: 'A wide view of a beautiful cascading waterfall in a lush jungle.',
    hint: 'waterfall jungle',
    title: 'Kalthota Doowili ella',
    description: "Known as 'Doowili Ella' or 'Dusty Falls' because its spray resembles a cloud of dust, this secluded waterfall is a reward for the adventurous traveler.",
    slug: 'kalthota-doowili-ella'
  },
  {
    src: 'https://content-provider.payshia.com/sapphire-trail/images/img39.webp',
    alt: 'Elephants at Udawalawe National Park',
    hint: 'elephants safari',
    title: 'Udawalawa National Park',
    description: "Udawalawe National Park is an unparalleled destination for wildlife enthusiasts, particularly famous for its large population of Sri Lankan elephants.",
    slug: 'udawalawe-national-park'
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
          <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {gallery.map((image, index) => (
              <Link key={index} href={`/explore-ratnapura/${image.slug}`} className="group relative overflow-hidden rounded-xl block">
                <Image
                  src={image.src}
                  alt={image.alt}
                  data-ai-hint={image.hint}
                  width={600}
                  height={750}
                  className="object-cover w-full h-[400px] transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-left">
                    <h3 className="text-xl font-headline font-bold text-white">{image.title}</h3>
                    <p className="text-sm text-white/90 mt-2">{image.description}</p>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Mobile view swiper */}
          <div className="sm:hidden w-full relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex -ml-4">
                {gallery.map((image, index) => (
                  <div className="flex-grow-0 flex-shrink-0 basis-full min-w-0 pl-4" key={index}>
                    <Link href={`/explore-ratnapura/${image.slug}`} className="group relative overflow-hidden rounded-xl block">
                       <Image
                        src={image.src}
                        alt={image.alt}
                        data-ai-hint={image.hint}
                        width={600}
                        height={750}
                        className="object-cover w-full h-[450px]"
                      />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 text-left">
                         <h3 className="text-xl font-headline font-bold text-white">{image.title}</h3>
                         <p className="text-sm text-white/90 mt-2">{image.description}</p>
                       </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={scrollPrev} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 p-0 bg-background/50 hover:bg-background/80 border-0 text-foreground z-10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button onClick={scrollNext} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 p-0 bg-background/50 hover:bg-background/80 border-0 text-foreground z-10">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-w-3xl">
            <p className="text-lg text-muted-foreground">
              From waterfalls to ancient temples and vibrant bazaars, Ratnapura is a treasure trove for explorers. Discover what makes this region truly shine.
            </p>
          </div>

          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/explore-ratnapura">More Info</Link>
          </Button>
        </ScrollAnimate>
      </div>
    </section>
  );
}
