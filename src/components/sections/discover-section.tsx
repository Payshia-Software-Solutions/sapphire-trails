
"use client";

import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import useEmblaCarousel, { type EmblaCarouselType, type EmblaOptionsType } from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getFullImageUrl } from '@/lib/utils';

// A unique key used to store and retrieve CMS data from localStorage.
const CMS_DATA_KEY = 'sapphire-cms-data';

// Default content for this section, used as a fallback if no data is in localStorage.
const defaultContent = {
  description: "Embark on an exclusive journey through the heart of Sri Lanka's gem country. The Sapphire Trails offers an immersive experience into Ratnapura's rich heritage, from dazzling gem mines and lush tea estates to exquisite dining and vibrant local culture. Let us guide you on a luxurious adventure that unveils the true treasures of the island.",
  images: [
    {
      src: 'https://content-provider.payshia.com/sapphire-trail/images/img2.webp',
      alt: 'A person sifting through gravel and dirt in a woven basket, searching for gems.',
      hint: 'gem mining',
    },
    {
      src: 'https://content-provider.payshia.com/sapphire-trail/images/img36.webp',
      alt: 'People swimming and enjoying the cool water at the base of a waterfall.',
      hint: 'waterfall swimming',
    },
    {
      src: 'https://content-provider.payshia.com/sapphire-trail/images/img37.webp',
      alt: 'A vibrant collection of polished gemstones displayed in black trays.',
      hint: 'gemstones collection',
    },
  ]
};

const TWEEN_FACTOR = 1.2;

const setTweenFactor = (emblaApi: EmblaCarouselType) => {
  const engine = emblaApi.internalEngine();
  engine.scrollBody.useMass(1 / TWEEN_FACTOR);
  engine.scrollBody.useSpeed(TWEEN_FACTOR);
  engine.dragHandler.useSpeed(TWEEN_FACTOR);
};

const useTweenScale = (emblaApi: EmblaCarouselType | undefined) => {
  const [tweenValues, setTweenValues] = useState<number[]>([]);

  const onScroll = useCallback(() => {
    if (!emblaApi) return;
    const engine = emblaApi.internalEngine();
    const scrollProgress = emblaApi.scrollProgress();

    const styles = emblaApi.scrollSnapList().map((scrollSnap, index) => {
      if (!emblaApi.slidesInView().includes(index)) return 0;
      let diffToTarget = scrollSnap - scrollProgress;

      if (engine.options.loop) {
        engine.slideLooper.loopPoints.forEach((loopItem) => {
          const target = loopItem.target();
          if (index === loopItem.index && target !== 0) {
            const sign = Math.sign(target);
            if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress);
            if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress);
          }
        });
      }
      return 1 - Math.abs(diffToTarget * 0.5);
    });
    setTweenValues(styles);
  }, [emblaApi, setTweenValues]);

  useEffect(() => {
    if (!emblaApi) return;

    setTweenFactor(emblaApi);
    onScroll();
    emblaApi.on('scroll', onScroll);
    emblaApi.on('reInit', onScroll);
    
    return () => {
        emblaApi.off('scroll', onScroll);
    }
  }, [emblaApi, onScroll]);

  return tweenValues;
};


// The DiscoverSection component displays a text description and an interactive image carousel.
export function DiscoverSection() {
  const [content, setContent] = useState(defaultContent);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const OPTIONS: EmblaOptionsType = { loop: true, align: 'center', skipSnaps: false };
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);

  const tweenValues = useTweenScale(emblaApi);

  useEffect(() => {
    try {
      const storedDataRaw = localStorage.getItem(CMS_DATA_KEY);
      if (storedDataRaw) {
        const storedData = JSON.parse(storedDataRaw);
        if (storedData.discover) {
          const images = storedData.discover.images?.length === 3 ? storedData.discover.images : defaultContent.images;
          setContent({ ...defaultContent, ...storedData.discover, images });
        }
      }
    } catch (error) {
      console.error("Failed to load discover section CMS data", error);
    }
  }, []);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi]);
  
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect) };
  }, [emblaApi]);

  const handleDotClick = (index: number) => {
    if (emblaApi) {
        emblaApi.scrollTo(index);
    }
  }


  return (
    <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6 flex flex-col items-center">
        <ScrollAnimate className="max-w-3xl text-center">
          <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl">
            Discover the Sapphire Trails
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {content.description}
          </p>
        </ScrollAnimate>

        <ScrollAnimate 
            className="mt-16 w-full overflow-hidden"
        >
            <div className="relative">
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex -ml-4">
                        {content.images.map((image, index) => (
                            <div className="flex-grow-0 flex-shrink-0 basis-full md:basis-1/2 lg:basis-1/3 min-w-0 pl-4" key={index}>
                                <div className="h-full w-full transition-transform duration-200 ease-out" style={{transform: `scale(${tweenValues[index] || 0})`}}>
                                    <Image
                                    src={getFullImageUrl(image.src)}
                                    alt={image.alt}
                                    data-ai-hint={image.hint}
                                    width={600}
                                    height={400}
                                    className="rounded-2xl object-cover w-full h-60 md:h-80 shadow-2xl"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <Button onClick={scrollPrev} className="absolute left-0 md:left-8 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 p-0 bg-background/50 hover:bg-background/80 border-0 text-foreground z-10">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <Button onClick={scrollNext} className="absolute right-0 md:right-8 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 p-0 bg-background/50 hover:bg-background/80 border-0 text-foreground z-10">
                    <ArrowRight className="h-5 w-5" />
                </Button>
            </div>
        </ScrollAnimate>

        {/* The navigation dots for the carousel. The active dot is highlighted. */}
        <div className="mt-12 flex justify-center gap-3">
          {content.images.map((_, index) => (
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
