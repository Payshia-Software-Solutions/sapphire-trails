
"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import { getFullImageUrl } from '@/lib/utils';

const CMS_DATA_KEY = 'sapphire-cms-data';

const defaultContent = {
  description: "Get more than just a glimpse of this captivating world with our unique Gem Mine Tours. In the heart of Ratnapura, Sri Lanka—the legendary 'City of Gems'—this authentic gemstone tour takes you into actual mining pits. Discover the ancient tradition behind world-famous Ceylon Sapphires, guided by experts. It's a rich experience far beyond the usual tourist trail.",
  images: [
    { src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-1-optimized.webp', alt: 'Close-up of a vibrant blue sapphire from a gem tour held between tweezers.', hint: 'blue sapphire gem tour' },
    { src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-2-optimized.webp', alt: 'Miners working inside a traditional gem mine on a Sapphire Trails tour.', hint: 'gem mine tour' },
    { src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-3-optimized.webp', alt: 'A hand holding a variety of rough, uncut gemstones found during a gem mining tour.', hint: 'rough gemstones mining' },
    { src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-4-optimized.webp', alt: 'Exquisite sapphire and diamond jewelry, a result of a successful gem tour.', hint: 'sapphire jewelry' },
    { src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-5-optimized.webp', alt: 'A scenic panoramic view of the lush Ratnapura landscape, the setting for our gem tours.', hint: 'ratnapura landscape' },
    { src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-6-optimized.webp', alt: 'A tourist examining a gemstone closely with a loupe on a gem mining tour.', hint: 'gem examination tour' },
    { src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-7-optimized.webp', alt: 'The interior of a gem cutting and polishing workshop, part of the gemstone tour experience.', hint: 'gem cutting workshop' },
    { src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-8-optimized.webp', alt: 'The bustling and vibrant atmosphere of the Ratnapura gem market.', hint: 'gem market' },
    { src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-9-optimized.webp', alt: 'A colorful collection of various polished gemstones on a display tray, sourced from local mines.', hint: 'gemstone collection' },
  ]
};

export function DiscoverSection() {
  const [content, setContent] = useState(defaultContent);

  useEffect(() => {
    try {
      const storedDataRaw = localStorage.getItem(CMS_DATA_KEY);
      if (storedDataRaw) {
        const storedData = JSON.parse(storedDataRaw);
        if (storedData.discover) {
           const images = storedData.discover.images?.length === 9 ? storedData.discover.images : defaultContent.images;
           setContent({ ...defaultContent, ...storedData.discover, images });
        }
      }
    } catch (error) {
      console.error("Failed to load discover section CMS data", error);
    }
  }, []);

  return (
    <section id="about" className="w-full h-screen flex flex-col justify-center bg-background-alt scroll-section py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6 flex flex-col h-full">
        <ScrollAnimate className="max-w-3xl mx-auto text-center flex-shrink-0">
          <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl">
            Discover Our Gem Mine Tours
          </h2>
          <p className="mt-4 text-muted-foreground text-base">
            Get more than just a glimpse of this captivating world with our unique Gem Mine Tours in the heart of Ratnapura, Sri Lanka, the legendary 'City of Gems.' This authentic experience takes you through the depths of actual mining pits to discover the ancient tradition behind the mining of world-famous Ceylon Sapphires. Under the guidance of experts in the trade, you'll have access to the entire process of gem mining, including the washing of gravel in traditional wicker baskets to the final sorting of the precious stones. It's a rich experience that offers much more than just the usual tourist experience.
          </p>
        </ScrollAnimate>

        <ScrollAnimate 
            className="mt-6 w-full max-w-6xl mx-auto flex-grow min-h-0"
        >
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-fr gap-2 md:gap-4 h-full">
              {content.images.map((image, index) => {
                let itemClass = '';
                if (index === 0) itemClass = 'md:col-span-2 md:row-span-2';
                else if (index === 5) itemClass = 'md:col-span-2';
                else if (index === 8) itemClass = 'col-span-2 md:col-span-4';

                return (
                  <div key={index} className={cn("relative w-full h-full overflow-hidden rounded-lg group", itemClass)}>
                      <Image
                          src={getFullImageUrl(image.src)}
                          alt={image.alt}
                          data-ai-hint={image.hint}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                  </div>
                )
              })}
            </div>
        </ScrollAnimate>
      </div>
    </section>
  );
}
