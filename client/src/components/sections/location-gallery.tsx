'use client';

import { useState } from "react";
import { Camera, Compass, Eye, Sparkles, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFullImageUrl } from "@/lib/utils";

interface ImageInfo {
  src: string;
  alt: string;
  hint?: string;
  is360?: boolean;
}

interface LocationGalleryProps {
  images: ImageInfo[];
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=800&auto=format&fit=crop&q=80';

export function LocationGallery({ images }: LocationGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  const handleNext = () => {
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx + 1) % images.length);
    }
  };

  const handlePrev = () => {
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx - 1 + images.length) % images.length);
    }
  };

  return (
    <section id="gallery" className="w-full py-16 sm:py-24 bg-background-alt border-b border-border/60 scroll-mt-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            <Camera className="h-3.5 w-3.5" />
            <span>Visual Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground tracking-tight">
            Destination Photo Gallery
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Explore breathtaking landscapes, mineral formations, and cultural scenes from this location.
          </p>
        </div>

        {/* Dynamic Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((image, index) => {
            const resolvedSrc = getFullImageUrl(image.src) || FALLBACK_IMAGE;
            return (
              <div
                key={index}
                onClick={() => setSelectedIdx(index)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer bg-black/40 border border-border/70 hover:border-primary/60 transition-all duration-300 shadow-sm hover:shadow-xl"
              >
                <img
                  src={resolvedSrc}
                  alt={image.alt || 'Destination Photo'}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                  <div className="flex justify-end">
                    {image.is360 && (
                      <Badge className="bg-purple-600 text-white text-[10px] gap-1 shadow">
                        <Compass className="h-3 w-3" /> 360° Panorama
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium line-clamp-2">
                      {image.alt || 'Sapphire Trails Expedition'}
                    </p>
                    <span className="text-[10px] text-primary flex items-center gap-1 mt-1 font-semibold">
                      <Eye className="h-3 w-3" /> Click to Expand
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Lightbox */}
        {selectedIdx !== null && (
          <Dialog open={selectedIdx !== null} onOpenChange={() => setSelectedIdx(null)}>
            <DialogContent className="max-w-5xl p-2 bg-black/95 border-border/50 text-white">
              <div className="relative aspect-[16/10] w-full flex items-center justify-center overflow-hidden rounded-xl bg-black">
                <img
                  src={getFullImageUrl(images[selectedIdx].src) || FALLBACK_IMAGE}
                  alt={images[selectedIdx].alt}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  className="max-h-full max-w-full object-contain"
                />

                {/* Lightbox Controls */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 hover:bg-primary text-white h-10 w-10 shadow"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 hover:bg-primary text-white h-10 w-10 shadow"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>

                {/* Caption Bar */}
                <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-md p-4 flex items-center justify-between text-xs border-t border-white/10">
                  <span className="font-medium text-amber-100 max-w-md truncate">
                    {images[selectedIdx].alt || 'Sapphire Trails Expedition Photo'}
                  </span>
                  <span className="text-muted-foreground font-mono">
                    {selectedIdx + 1} / {images.length}
                  </span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

      </div>
    </section>
  );
}