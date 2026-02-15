
"use client";

import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import useEmblaCarousel, { type EmblaCarouselType, type EmblaOptionsType } from 'embla-carousel-react';
import { getFullImageUrl } from '@/lib/utils';

const CMS_DATA_KEY = 'sapphire-cms-data';

const defaultContent = {
  description: "Get more than just a glimpse of this captivating world with our unique Gem Mine Tours in the heart of Ratnapura, Sri Lanka, the legendary 'City of Gems.' This authentic experience takes you through the depths of actual mining pits to discover the ancient tradition behind the mining of world-famous Ceylon Sapphires. Under the guidance of experts in the trade, you'll have access to the entire process of gem mining, including the washing of gravel in traditional wicker baskets to the final sorting of the precious stones. It's a rich experience that offers much more than just the usual tourist experience.",
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
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);
  
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

  useEffect(() => {
      if (!emblaApi) return;
      onSelect(emblaApi);
      emblaApi.on('select', onSelect);
      emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);


  return (
    <section id="about" className="w-full h-screen flex flex-col items-center justify-center bg-background-alt scroll-section">
      <div className="container mx-auto px-4 md:px-6">
        <ScrollAnimate className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl">
            Discover the Sapphire Trails
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {content.description}
          </p>
        </ScrollAnimate>

        <ScrollAnimate 
            className="mt-6 w-full max-w-6xl mx-auto"
        >
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex py-6" style={{ backfaceVisibility: 'hidden' }}>
                    {content.images.map((image, index) => (
                        <div
                            className={cn(
                                "flex-[0_0_80%] sm:flex-[0_0_60%] md:flex-[0_0_50%] min-w-0 relative",
                                 index === selectedIndex && "z-10"
                            )}
                            key={index}
                        >
                            <div
                                className={cn(
                                    "relative aspect-[4/3] w-full transition-transform duration-500 ease-out",
                                )}
                            >
                                <Image
                                    src={getFullImageUrl(image.src)}
                                    alt={image.alt}
                                    data-ai-hint={image.hint}
                                    fill
                                    className={cn(
                                        "rounded-2xl object-cover w-full h-full shadow-2xl transition-all duration-500 ease-out",
                                        index === selectedIndex ? "scale-105" : "scale-100"
                                    )}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ScrollAnimate>
      </div>
    </section>
  );
}
