
"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import { getFullImageUrl } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const CMS_DATA_KEY = 'sapphire-cms-data';

const defaultContent = {
  description: "Get more than just a glimpse of this captivating world with our unique Gem Mine Tours. In the heart of Ratnapura, Sri Lanka, the legendary 'City of Gems', this authentic gemstone tour takes you into actual mining pits. Discover the ancient tradition behind world-famous Ceylon Sapphires, guided by experts. It's a rich experience far beyond the usual tourist trail.",
  images: [
    { 
      src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-1-optimized.webp', 
      alt: 'A tourist gets fitted with a safety harness before a gem tour.', 
      hint: 'gem tour safety', 
      className: 'md:col-span-2 md:row-span-2',
      hoverDescription: "Prepare for an authentic Gem Mine Tour. Safety and adventure go hand-in-hand as you get ready to descend into a real mine."
    },
    { 
      src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-2-optimized.webp', 
      alt: 'A happy tourist smiles while holding his helmet straps during a gem mine tour.', 
      hint: 'happy tourist gem tour', 
      className: 'md:col-span-1 md:row-span-1',
      hoverDescription: "The thrill of discovery on our Gem Tour. This hands-on experience is what makes our gem tours unforgettable."
    },
    { 
      src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-3-optimized.webp', 
      alt: 'A miner works inside a dimly lit, traditional gem mine.', 
      hint: 'traditional gem mine', 
      className: 'md:col-span-1 md:row-span-1',
      hoverDescription: "Deep inside a traditional mine. This is the heart of our Gem Mine Tour, showcasing the authentic mining process."
    },
    { 
      src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-4-optimized.webp', 
      alt: 'Tourist washing gem gravel in a traditional basket during a Ratnapura gem mine tour', 
      hint: 'examining gemstone', 
      className: 'md:col-span-1 md:row-span-1',
      hoverDescription: "Inspecting a freshly found sapphire. Every Gem Tour concludes with a close-up look at these precious stones."
    },
    { 
      src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-5-optimized.webp', 
      alt: 'A person holds a piece of paper with several rough gemstones on it.', 
      hint: 'rough gemstones hand', 
      className: 'md:col-span-1 md:row-span-1',
      hoverDescription: "The rewards of a successful Gem Mine Tour. Hold raw, uncut sapphires straight from the earth."
    },
    { 
      src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-6-optimized.webp', 
      alt: 'A tourist gives a thumbs-up while wearing a hard hat.', 
      hint: 'tourist thumbs up', 
      className: 'md:col-span-1 md:row-span-1',
      hoverDescription: "An unforgettable adventure. Our guests love the unique access provided by our expert-led Gem Tour."
    },
    { 
      src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-7-optimized.webp', 
      alt: 'A person sharpens a tool on a traditional gem cutting wheel.', 
      hint: 'gem cutting wheel', 
      className: 'md:col-span-2 md:row-span-1',
      hoverDescription: "The art of transformation. Witness traditional gem cutting, a key part of the complete Gem Mine Tour experience."
    },
    { 
      src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-8-optimized.webp', 
      alt: 'A gemologist sorts and grades small gemstones at a well-lit desk.', 
      hint: 'gemologist sorting gems', 
      className: 'md:col-span-1 md:row-span-1',
      hoverDescription: "From rough stone to finished jewel. Our gemologists explain the sorting process, an essential part of every Gem Tour."
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
           const images = storedData.discover.images?.length === 8 ? storedData.discover.images : defaultContent.images;
           setContent({ ...defaultContent, ...storedData.discover, images });
        }
      }
    } catch (error) {
      console.error("Failed to load discover section CMS data", error);
    }
  }, []);

  return (
    <section id="about" className="w-full bg-background-alt py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <ScrollAnimate className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl">
            Discover Our Gem Mine Tours
          </h2>
          <p className="mt-4 text-muted-foreground text-base">
           Get more than just a glimpse of this captivating world with our unique Gem Mine Tours. In the heart of Ratnapura, Sri Lanka, the legendary 'City of Gems', this authentic gemstone tour takes you into actual mining pits. Discover the ancient tradition behind world-famous Ceylon Sapphires, guided by experts. It's a rich experience far beyond the usual tourist trail.
          </p>
        </ScrollAnimate>

        <ScrollAnimate 
            className="w-full"
        >
            <div className="grid grid-cols-2 md:grid-cols-4 md:auto-rows-[200px] gap-2 md:gap-4">
                {content.images.map((image, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <div className={cn("relative w-full overflow-hidden rounded-lg group cursor-pointer aspect-[4/3] md:aspect-auto", image.className)}>
                          <Image
                              src={getFullImageUrl(image.src)}
                              alt={image.alt}
                              data-ai-hint={image.hint}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4 text-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <p className="text-sm">{image.hoverDescription}</p>
                          </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl w-full p-0 border-0 bg-transparent">
                        <Carousel className="w-full" opts={{ startIndex: index, loop: true }}>
                            <CarouselContent>
                                {content.images.map((img, i) => (
                                    <CarouselItem key={i}>
                                        <div className="relative aspect-video">
                                            <Image src={getFullImageUrl(img.src)} alt={img.alt} fill className="object-contain" />
                                        </div>
                                         {img.hoverDescription && (
                                            <p className="mt-2 text-center text-white text-sm bg-black/50 rounded-b-lg p-2 max-w-3xl mx-auto">{img.hoverDescription}</p>
                                        )}
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-2 text-white bg-black/20 hover:bg-black/50 border-white/20" />
                            <CarouselNext className="right-2 text-white bg-black/20 hover:bg-black/50 border-white/20" />
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

