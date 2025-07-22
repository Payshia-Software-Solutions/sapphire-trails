
'use client';

import Image from "next/image";
import type { GalleryImage } from "@/lib/packages-data";

interface TourExperienceGalleryProps {
  images: GalleryImage[];
}

export function TourExperienceGallery({ images }: TourExperienceGalleryProps) {
  if (!images || images.length === 0) {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
             <div className="container mx-auto px-4 md:px-6 text-center">
                <h2 className="text-3xl font-headline font-bold text-primary sm:text-4xl">Experience Gallery</h2>
                <p className="text-muted-foreground mt-4">No gallery images have been added for this tour yet.</p>
             </div>
        </section>
    );
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-headline font-bold text-center mb-12 text-primary sm:text-4xl">
          Experience Gallery
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square overflow-hidden rounded-lg group">
              <Image
                src={image.src}
                alt={image.alt}
                data-ai-hint={image.hint}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
