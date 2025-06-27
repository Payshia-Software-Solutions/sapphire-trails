"use client";

import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const images = [
    {
      src: 'https://content-provider.payshia.com/sapphire-trail/images/img2.webp',
      alt: 'A person sifting through gravel and dirt in a woven basket, searching for gems.',
      hint: 'gem mining',
    },
    {
      src: 'https://content-provider.payshia.com/sapphire-trail/images/img36.webp',
      alt: 'People swimming and enjoying the cool water at the base of a waterfall.',
      hint: 'waterfall swimming',
    },
    {
      src: 'https://content-provider.payshia.com/sapphire-trail/images/img37.webp',
      alt: 'A vibrant collection of polished gemstones displayed in black trays.',
      hint: 'gemstones collection',
    },
];

export function DiscoverSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi]);
  
  // When user swipes the mobile carousel, update the activeIndex
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect) };
  }, [emblaApi]);

  // When a dot is clicked, update embla's position
  const handleDotClick = (index: number) => {
    setActiveIndex(index);
    if (emblaApi) {
        emblaApi.scrollTo(index);
    }
  }


  return (
    <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6 flex flex-col items-center">
        <ScrollAnimate className="max-w-3xl text-center">
          <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl">
            Discover the Sapphire Trails
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Embark on an exclusive journey through the heart of Sri Lanka&apos;s gem country. The Sapphire Trails offers an immersive experience into Ratnapura&apos;s rich heritage, from dazzling gem mines and lush tea estates to exquisite dining and vibrant local culture. Let us guide you on a luxurious adventure that unveils the true treasures of the island.
          </p>
        </ScrollAnimate>

        <ScrollAnimate 
            className="mt-16 w-full"
        >
            {/* Mobile View: Standard Swiper */}
            <div className="md:hidden">
              <div className="relative">
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex -ml-4">
                    {images.map((image, index) => (
                      <div className="flex-grow-0 flex-shrink-0 basis-4/5 min-w-0 pl-4" key={index}>
                        <Image
                          src={image.src}
                          alt={image.alt}
                          data-ai-hint={image.hint}
                          width={600}
                          height={400}
                          className="rounded-2xl object-cover w-full h-60"
                        />
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
            </div>

            {/* Desktop View: Cover-flow effect */}
            <div className="relative h-[400px] w-full max-w-4xl mx-auto hidden md:block">
                {images.map((image, index) => {
                    const rawOffset = index - activeIndex;
                    const directedOffset = Math.abs(rawOffset) > images.length / 2 
                        ? rawOffset - Math.sign(rawOffset) * images.length 
                        : rawOffset;

                    const isCenter = directedOffset === 0;
                    const translateX = directedOffset * 50;
                    const scale = isCenter ? 1 : 0.8;
                    const zIndex = images.length - Math.abs(directedOffset);
                    const opacity = Math.abs(directedOffset) > 1 ? 0 : 1;
                    const filter = isCenter ? 'none' : 'brightness(0.7)';
                    
                    return (
                        <div
                            key={index}
                            className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center transition-all duration-1000 ease-out"
                            style={{
                                transform: `translateX(${translateX}%) scale(${scale})`,
                                zIndex: zIndex,
                                opacity: opacity,
                                filter: filter,
                            }}
                        >
                            <Image
                                src={image.src}
                                alt={image.alt}
                                data-ai-hint={image.hint}
                                width={600}
                                height={400}
                                className="rounded-2xl object-cover shadow-2xl"
                            />
                        </div>
                    );
                })}
            </div>
        </ScrollAnimate>

        <div className="mt-12 flex justify-center gap-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={cn(
                'h-2.5 w-2.5 rounded-full transition-colors',
                activeIndex === index ? 'bg-primary' : 'bg-muted/50'
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}