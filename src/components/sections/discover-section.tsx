"use client";

import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getFullImageUrl } from '@/lib/utils';

// A unique key used to store and retrieve CMS data from localStorage.
const CMS_DATA_KEY = 'sapphire-cms-data';

// Default content for this section, used as a fallback if no data is in localStorage.
const defaultContent = {
  description: "Embark on an exclusive journey through the heart of Sri Lanka's gem country. The Sapphire Trails offers an immersive experience into Ratnapura's rich heritage, from dazzling gem mines and lush tea estates to exquisite dining and vibrant local culture. Let us guide you on a luxurious adventure that unveils the true treasures of the island.",
  images: [
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
  ]
};

// The DiscoverSection component displays a text description and an interactive image carousel.
// It features a "cover-flow" effect on desktop and a standard swiper on mobile.
export function DiscoverSection() {
  // `content` state holds the description and images, initialized with default values.
  const [content, setContent] = useState(defaultContent);
  // `activeIndex` tracks the currently centered image in the carousel.
  const [activeIndex, setActiveIndex] = useState(0);
  // `emblaRef` and `emblaApi` are from the useEmblaCarousel hook for managing the mobile swiper.
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });

  // This effect runs once on the client to load dynamic content from localStorage.
  useEffect(() => {
    try {
      const storedDataRaw = localStorage.getItem(CMS_DATA_KEY);
      if (storedDataRaw) {
        const storedData = JSON.parse(storedDataRaw);
        if (storedData.discover) {
          // Ensure there are exactly 3 images, otherwise fall back to defaults.
          const images = storedData.discover.images?.length === 3 ? storedData.discover.images : defaultContent.images;
          setContent({ ...defaultContent, ...storedData.discover, images });
        }
      }
    } catch (error) {
      console.error("Failed to load discover section CMS data", error);
    }
  }, []); // The empty dependency array ensures this runs only once after the component mounts.

  // Callback functions to control the mobile carousel.
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi]);
  
  // This effect syncs the `activeIndex` state with the Embla carousel's state when the user swipes.
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect) };
  }, [emblaApi]);

  // This function handles clicks on the dots, updating both the activeIndex and the carousel's position.
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
            {content.description}
          </p>
        </ScrollAnimate>

        <ScrollAnimate 
            className="mt-16 w-full overflow-hidden"
        >
            {/* Mobile View: A standard swipeable carousel using the Embla library. */}
            <div className="md:hidden">
              <div className="relative">
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex -ml-4">
                    {content.images.map((image, index) => (
                      <div className="flex-grow-0 flex-shrink-0 basis-4/5 min-w-0 pl-4" key={index}>
                        <Image
                          src={getFullImageUrl(image.src)}
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

            {/* 
              Desktop View: A "cover-flow" style carousel.
              This is achieved by mapping over the images and calculating CSS transforms based on their
              position relative to the `activeIndex`. The image at the activeIndex is centered and scaled up,
              while others are moved to the side, scaled down, and slightly faded.
            */}
            <div className="relative h-[400px] w-full max-w-4xl mx-auto hidden md:block">
                {content.images.map((image, index) => {
                    // Calculate the offset of the current image from the active one.
                    const rawOffset = index - activeIndex;
                    // This logic handles wrapping around (e.g., from the last image to the first).
                    const directedOffset = Math.abs(rawOffset) > content.images.length / 2 
                        ? rawOffset - Math.sign(rawOffset) * content.images.length 
                        : rawOffset;

                    const isCenter = directedOffset === 0;
                    // CSS properties are calculated based on the offset.
                    const translateX = directedOffset * 50; // Move non-active images to the side.
                    const scale = isCenter ? 1 : 0.8; // Scale down non-active images.
                    const zIndex = content.images.length - Math.abs(directedOffset); // Ensure the center image is on top.
                    const opacity = Math.abs(directedOffset) > 1 ? 0 : 1; // Fade out images that are far from the center.
                    const filter = isCenter ? 'none' : 'brightness(0.7)'; // Dim non-active images.
                    
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
                                src={getFullImageUrl(image.src)}
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

        {/* The navigation dots for the carousel. The active dot is highlighted. */}
        <div className="mt-12 flex justify-center gap-3">
          {content.images.map((_, index) => (
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
