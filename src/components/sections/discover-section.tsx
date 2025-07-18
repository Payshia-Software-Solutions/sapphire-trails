
"use client";

import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import useEmblaCarousel, { type EmblaCarouselType, type EmblaOptionsType } from 'embla-carousel-react';
import { getFullImageUrl } from '@/lib/utils';

const CMS_DATA_KEY = 'sapphire-cms-data';

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

export function DiscoverSection() {
  const [content, setContent] = useState(defaultContent);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    try {
      const storedDataRaw = localStorage.getItem(CMS_DATA_KEY);
      if (storedDataRaw) {
        const storedData = JSON.parse(storedDataRaw);
        if (storedData.discover) {
          const images = storedData.discover.images?.length === 3 ? storedData.discover.images : defaultContent.images;
          setContent({ ...defaultContent, ...storedData.discover, images });
        }
      }
    } catch (error) {
      console.error("Failed to load discover section CMS data", error);
    }
  }, []);

  const onScroll = useCallback((emblaApi: EmblaCarouselType) => {
    setScrollProgress(emblaApi.scrollProgress());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = (emblaApi: EmblaCarouselType) => {
      setActiveIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('scroll', onScroll);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    onSelect(emblaApi);
    return () => {
      emblaApi.off('scroll', onScroll);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onScroll]);

  const handleDotClick = (index: number) => {
    emblaApi?.scrollTo(index);
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
            className="mt-16 w-full max-w-5xl"
        >
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex -ml-4" style={{ backfaceVisibility: 'hidden' }}>
                    {content.images.map((image, index) => {
                         const slideProgress = emblaApi ? emblaApi.scrollProgress() * emblaApi.scrollSnapList().length : 0;
                         const slideDistance = (slideProgress - index) * 100;

                         const scale = 1 - Math.abs(slideDistance / 200);
                         const opacity = 1 - Math.abs(slideDistance / 100);
                         const zIndex = 10 - Math.abs(index - activeIndex);

                        return (
                           <div className="flex-[0_0_80%] sm:flex-[0_0_60%] md:flex-[0_0_50%] min-w-0 pl-4" key={index} style={{ position: 'relative' }}>
                                <div
                                    className="relative h-full w-full transition-transform duration-200 ease-out"
                                     style={{
                                         transform: `scale(${Math.max(0.8, scale)})`,
                                         opacity: Math.max(0, opacity),
                                         zIndex: zIndex,
                                     }}
                                >
                                    <Image
                                        src={getFullImageUrl(image.src)}
                                        alt={image.alt}
                                        data-ai-hint={image.hint}
                                        width={600}
                                        height={400}
                                        className="rounded-2xl object-cover w-full h-60 md:h-80 shadow-2xl"
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </ScrollAnimate>

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
