"use client";

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import { getFullImageUrl } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useSiteContent } from '@/lib/site-content';

const defaultClassNames = [
  'md:col-span-2 md:row-span-2',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-2 md:row-span-1',
  'md:col-span-1 md:row-span-1',
];

export function DiscoverSection() {
  const { content: siteContent } = useSiteContent();
  const discover = siteContent.homepage.discover;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  return (
    <section id="about" className="w-full bg-background-alt py-12 md:py-24 lg:py-32">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <ScrollAnimate className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl">
            {discover.heading || 'Discover Our Gem Mine Tours'}
          </h2>
          <p className="mt-4 text-muted-foreground text-base leading-relaxed">
            {discover.description}
          </p>
        </ScrollAnimate>

        <ScrollAnimate className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 md:auto-rows-[200px] gap-2 md:gap-4">
                {discover.images.map((image, index) => (
                    <Dialog key={index}>
                        <DialogTrigger asChild>
                            <div 
                                className={cn(
                                    "relative overflow-hidden rounded-lg group cursor-pointer h-full min-h-[150px] shadow-sm",
                                    defaultClassNames[index % defaultClassNames.length]
                                )}
                                onClick={() => setSelectedImageIndex(index)}
                            >
                                <Image
                                    src={getFullImageUrl(image.src)}
                                    alt={image.alt}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                     <p className="text-white text-xs sm:text-sm font-medium line-clamp-3">
                                        {image.hoverDescription}
                                     </p>
                                </div>
                            </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] p-2 bg-background/90 backdrop-blur-md border-border/80 flex items-center justify-center">
                            <Carousel opts={{ startIndex: selectedImageIndex, loop: true }} className="w-full">
                                <CarouselContent>
                                    {discover.images.map((img, i) => (
                                        <CarouselItem key={i}>
                                            <div className="relative aspect-[4/3] w-full max-h-[80vh]">
                                                <Image
                                                    src={getFullImageUrl(img.src)}
                                                    alt={img.alt}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                             <div className="p-4 text-center">
                                                <p className="text-sm text-foreground">{img.alt}</p>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="left-2" />
                                <CarouselNext className="right-2" />
                            </Carousel>
                        </DialogContent>
                    </Dialog>
                ))}
            </div>
        </ScrollAnimate>
      </div>
    </section>
  );
}
