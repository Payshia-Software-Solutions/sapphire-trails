
"use client"

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface ImageInfo {
  src: string;
  alt: string;
  hint: string;
  is360?: boolean;
}

interface LocationGalleryProps {
  images: ImageInfo[];
}

const ImageWithOverlay = ({ image, className }: { image: ImageInfo; className?: string }) => (
  <div className={`relative overflow-hidden rounded-lg group ${className}`}>
    <Image
      src={image.src}
      alt={image.alt}
      data-ai-hint={image.hint}
      fill
      className="object-cover transition-transform duration-300 group-hover:scale-105"
    />
  </div>
);

export function LocationGallery({ images }: LocationGalleryProps) {
  if (!images || images.length === 0) {
    return null;
  }

  const mainImage = images[0];
  const thumbImages = images.slice(1, 5);
  const remainingCount = images.length - 5;

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-headline font-bold text-center mb-12 text-primary sm:text-4xl">
          Experience the Wonder
        </h2>
        <Dialog>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <DialogTrigger asChild>
              <div className="cursor-pointer">
                <ImageWithOverlay image={mainImage} className="aspect-[4/3] md:aspect-auto md:h-full" />
              </div>
            </DialogTrigger>
            
            <div className="grid grid-cols-2 grid-rows-2 gap-4 md:gap-6">
              {thumbImages.map((image, index) => (
                <DialogTrigger key={index} asChild>
                  <div className="cursor-pointer">
                    <ImageWithOverlay image={image} className="aspect-square" />
                  </div>
                </DialogTrigger>
              ))}
              {remainingCount > 0 && (
                 <DialogTrigger asChild>
                    <div className="relative overflow-hidden rounded-lg group aspect-square cursor-pointer">
                        <Image
                            src={images[4].src}
                            alt={images[4].alt}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105 filter brightness-50"
                        />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <Plus className="h-10 w-10 text-white" />
                            <span className="text-3xl font-bold text-white">{remainingCount}</span>
                        </div>
                    </div>
                 </DialogTrigger>
              )}
            </div>
          </div>
          <DialogContent className="max-w-4xl p-0 border-0 bg-transparent">
             <Carousel className="w-full">
                <CarouselContent>
                    {images.map((image, index) => (
                        <CarouselItem key={index}>
                            <div className="relative aspect-video">
                                <Image src={image.src} alt={image.alt} fill className="object-contain" />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
             </Carousel>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
