"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getFullImageUrl } from '@/lib/utils';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import { cn } from '@/lib/utils';

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
      src: 'https://content-provider.payshia.com/sapphire-trail/images/img37.webp',
      alt: 'A vibrant collection of polished gemstones displayed in black trays.',
      hint: 'gemstones collection'
    },
    {
      src: 'https://content-provider.payshia.com/sapphire-trail/images/img36.webp',
      alt: 'People swimming and enjoying the cool water at the base of a waterfall.',
      hint: 'waterfall swimming',
    },
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
          const images = storedData.discover.images?.length === 3 ? storedData.discover.images : defaultContent.images;
          setContent({ ...defaultContent, ...storedData.discover, images });
        }
      }
    } catch (error) {
      console.error("Failed to load discover section CMS data", error);
    }
  }, []);

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
            className="mt-16 w-full max-w-6xl"
        >
          <div className="flex justify-center items-center gap-4 md:gap-6">
            {/* Left Image */}
            <div className="relative w-1/4 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={getFullImageUrl(content.images[0].src)}
                alt={content.images[0].alt}
                data-ai-hint={content.images[0].hint}
                fill
                className="object-cover"
              />
            </div>

            {/* Center Image */}
            <div className="relative w-1/2 aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={getFullImageUrl(content.images[1].src)}
                alt={content.images[1].alt}
                data-ai-hint={content.images[1].hint}
                fill
                className="object-cover"
              />
            </div>

            {/* Right Image */}
            <div className="relative w-1/4 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={getFullImageUrl(content.images[2].src)}
                alt={content.images[2].alt}
                data-ai-hint={content.images[2].hint}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </ScrollAnimate>

      </div>
    </section>
  );
}
