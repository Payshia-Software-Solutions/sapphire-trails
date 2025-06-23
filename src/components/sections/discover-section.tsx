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
  const [activeDot, setActiveDot] = useState(0);

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

        <ScrollAnimate className="mt-16 w-full flex justify-center">
          <div className="flex items-center justify-center">
            <div className="relative z-10 -mr-20 md:-mr-32 transform transition-transform duration-500 hover:scale-105">
              <Image
                src={images[0].src}
                alt={images[0].alt}
                data-ai-hint={images[0].hint}
                width={500}
                height={350}
                className="rounded-2xl object-cover shadow-2xl"
              />
            </div>
            <div className="relative z-20 transform transition-transform duration-500 hover:scale-105">
              <Image
                src={images[1].src}
                alt={images[1].alt}
                data-ai-hint={images[1].hint}
                width={600}
                height={400}
                className="rounded-2xl object-cover shadow-2xl"
              />
            </div>
            <div className="relative z-10 -ml-20 md:-ml-32 transform transition-transform duration-500 hover:scale-105">
              <Image
                src={images[2].src}
                alt={images[2].alt}
                data-ai-hint={images[2].hint}
                width={500}
                height={350}
                className="rounded-2xl object-cover shadow-2xl"
              />
            </div>
          </div>
        </ScrollAnimate>

        <div className="mt-8 flex justify-center gap-3">
          {[0, 1, 2, 3].map((index) => (
            <button
              key={index}
              onClick={() => setActiveDot(index)}
              className={cn(
                'h-2.5 w-2.5 rounded-full transition-colors',
                activeDot === index ? 'bg-primary' : 'bg-muted/50'
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
