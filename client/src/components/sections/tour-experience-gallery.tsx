
'use client';

import Image from "next/image";
import { useState } from "react";
import type { GalleryImage } from "@/lib/packages-data";

interface TourExperienceGalleryProps {
  images: GalleryImage[];
}

export function TourExperienceGallery({ images }: TourExperienceGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <section className="w-full py-10 md:py-14 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6 max-w-screen-2xl">

        {/* Section header */}
        <div className="max-w-2xl mb-6">
          <p className="text-primary font-serif uppercase tracking-widest text-xs mb-3">Photo Gallery</p>
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground leading-snug">
            Experience Gallery
          </h2>
        </div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-xl cursor-pointer group
                ${index === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'}
              `}
              onClick={() => setActiveIndex(index)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                data-ai-hint={image.hint}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {activeIndex !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setActiveIndex(null)}
          >
            <div className="relative max-w-4xl w-full max-h-[90vh] aspect-video">
              <Image
                src={images[activeIndex].src}
                alt={images[activeIndex].alt}
                fill
                className="object-contain"
              />
            </div>
            <button
              className="absolute top-4 right-6 text-white text-4xl font-light hover:text-primary transition-colors"
              onClick={() => setActiveIndex(null)}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
