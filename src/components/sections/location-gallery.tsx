import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

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
  <div className={cn("relative overflow-hidden rounded-lg", className)}>
    <Image
      src={image.src}
      alt={image.alt}
      data-ai-hint={image.hint}
      layout="fill"
      objectFit="cover"
      className="transition-transform duration-300 hover:scale-105"
    />
    {image.is360 && (
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/20 hover:text-white">
          <Play className="h-5 w-5 mr-2 fill-white"/>
          360° View
        </Button>
      </div>
    )}
  </div>
);

export function LocationGallery({ images }: LocationGalleryProps) {
  if (!images || images.length === 0) {
    return null;
  }
  
  const mainImage = images[0];
  const sideImages = images.slice(1, 5);

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-headline font-bold text-center mb-12 text-primary sm:text-4xl">
          Experience the Wonder
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <ImageWithOverlay image={mainImage} className="aspect-[4/5]" />
          
          <div className="grid grid-cols-2 grid-rows-2 gap-4 md:gap-6">
            {sideImages.map((image, index) => (
              <ImageWithOverlay key={index} image={image} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
