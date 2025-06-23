"use client";

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ScrollAnimate } from '@/components/shared/scroll-animate';

const images = [
    {
      src: 'https://placehold.co/500x350.png',
      alt: 'A pair of hands cupping a collection of rough, uncut blue sapphires.',
      hint: 'raw sapphires',
    },
    {
      src: 'https://placehold.co/600x400.png',
      alt: 'A person sifting through gravel and dirt in a woven basket, searching for gems.',
      hint: 'gem mining',
    },
    {
      src: 'https://placehold.co/500x350.png',
      alt: 'A close-up of a woven basket filled with pebbles and potential gemstones.',
      hint: 'sifting gems',
    },
];

export function DiscoverSection() {
  const [activeIndex, setActiveIndex] = useState(1);

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6 flex flex-col items-center">
        <ScrollAnimate className="max-w-3xl text-center">
          <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl">
            Discover the Sapphire Trails
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Embark on an exclusive journey through the heart of Sri Lanka's gem country. The Sapphire Trails offers an immersive experience into Ratnapura's rich heritage, from dazzling gem mines and lush tea estates to exquisite dining and vibrant local culture. Let us guide you on a luxurious adventure that unveils the true treasures of the island.
          </p>
        </ScrollAnimate>

        <ScrollAnimate className="mt-16 w-full">
            <div className="relative h-[400px] w-full max-w-4xl mx-auto">
                {images.map((image, index) => {
                    const isCenter = index === activeIndex;
                    const isLeft = index === (activeIndex - 1 + images.length) % images.length;
                    const isRight = index === (activeIndex + 1) % images.length;

                    const getTransform = () => {
                        if (isCenter) return 'translateX(0%) scale(1)';
                        if (isLeft) return 'translateX(-60%) scale(0.85)';
                        if (isRight) return 'translateX(60%) scale(0.85)';

                        const rawOffset = index - activeIndex;
                        const directedOffset = Math.abs(rawOffset) > images.length / 2 
                            ? rawOffset - Math.sign(rawOffset) * images.length 
                            : rawOffset;

                        return `translateX(${directedOffset * 70}%) scale(0.7)`;
                    };

                    const getZIndex = () => {
                        if (isCenter) return 20;
                        if (isLeft || isRight) return 10;
                        return 0;
                    }
                    
                    const getOpacity = () => {
                        if (isCenter || isLeft || isRight) return 1;
                        return 0;
                    }

                    return (
                        <div
                            key={index}
                            className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center transition-all duration-500 ease-in-out"
                            style={{
                                transform: getTransform(),
                                zIndex: getZIndex(),
                                opacity: getOpacity(),
                            }}
                        >
                            <Image
                                src={image.src}
                                alt={image.alt}
                                data-ai-hint={image.hint}
                                width={isCenter ? 600 : 450}
                                height={isCenter ? 400 : 300}
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
