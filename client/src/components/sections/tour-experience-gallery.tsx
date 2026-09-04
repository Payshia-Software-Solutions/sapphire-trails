'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import type { GalleryImage } from "@/lib/packages-data";
import { Camera, ChevronLeft, ChevronRight, X, Sparkles, Maximize2 } from "lucide-react";
import { getFullImageUrl } from "@/lib/utils";

interface TourExperienceGalleryProps {
  images: GalleryImage[];
}

const DEFAULT_GALLERY_IMAGE = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80';

export function TourExperienceGallery({ images }: TourExperienceGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIndex === null) return;
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowRight') setActiveIndex((activeIndex + 1) % images.length);
      if (e.key === 'ArrowLeft') setActiveIndex((activeIndex - 1 + images.length) % images.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, images.length]);

  if (!images || images.length === 0) return null;

  return (
    <section id="gallery" className="w-full py-16 sm:py-24 bg-background-alt border-b border-border/80 scroll-mt-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl">

        {/* Section Header */}
        <div className="max-w-3xl mb-10 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3.5 py-1 rounded-full">
            <Camera className="h-3.5 w-3.5" />
            <span>Visual Storytelling</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground tracking-tight">
            Tour Experience Gallery
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            A visual preview of active mining shafts, gem panning streams, lapidary workshops, and authentic experiences.
          </p>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => {
            const resolvedSrc = getFullImageUrl(image.src) || DEFAULT_GALLERY_IMAGE;
            const isFeatured = index === 0;

            return (
              <div
                key={index}
                className={`relative overflow-hidden rounded-2xl cursor-pointer group border border-border/80 bg-background shadow-sm hover:border-primary/50 transition-all duration-300 ${
                  isFeatured ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : 'aspect-square'
                }`}
                onClick={() => setActiveIndex(index)}
              >
                <Image
                  src={resolvedSrc}
                  alt={image.alt || `Tour Experience Photo ${index + 1}`}
                  data-ai-hint={image.hint}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-108"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <span className="text-xs font-serif font-bold text-white line-clamp-1">
                    {image.alt || 'View High-Resolution Photo'}
                  </span>
                  <span className="text-[10px] text-primary font-medium flex items-center gap-1 mt-0.5">
                    <Maximize2 className="h-3 w-3" /> Click to Expand
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fullscreen Lightbox Modal */}
        {activeIndex !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
            onClick={() => setActiveIndex(null)}
          >
            {/* Close Button */}
            <button
              className="absolute top-6 right-6 text-white hover:text-primary transition-colors p-2 z-50 bg-black/50 rounded-full"
              onClick={() => setActiveIndex(null)}
              aria-label="Close Lightbox"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Prev Button */}
            <button
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white hover:text-primary transition-colors p-3 bg-black/60 rounded-full z-50"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((activeIndex - 1 + images.length) % images.length);
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Next Button */}
            <button
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white hover:text-primary transition-colors p-3 bg-black/60 rounded-full z-50"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((activeIndex + 1) % images.length);
              }}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Active Image */}
            <div 
              className="relative max-w-5xl w-full max-h-[85vh] aspect-[16/10] sm:aspect-video flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={getFullImageUrl(images[activeIndex].src) || DEFAULT_GALLERY_IMAGE}
                alt={images[activeIndex].alt || 'Tour Gallery Photo'}
                fill
                className="object-contain"
                priority
              />
              
              {/* Caption Bar */}
              {images[activeIndex].alt && (
                <div className="absolute bottom-4 inset-x-4 max-w-xl mx-auto bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl text-center border border-white/10 text-white text-xs font-serif shadow-lg">
                  {images[activeIndex].alt}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
