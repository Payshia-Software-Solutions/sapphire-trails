'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { Pickaxe, Waves, Compass, Gem, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteContent } from '@/lib/site-content';
import { cn } from '@/lib/utils';

const defaultStepIcons = [Pickaxe, Waves, Compass, Gem];
const defaultStepImages = [
  'https://content-provider.payshia.com/sapphire-trail/images/tour-1-optimized.webp',
  'https://content-provider.payshia.com/sapphire-trail/images/tour-6-optimized.webp',
  'https://content-provider.payshia.com/sapphire-trail/images/tour-7-optimized.webp',
  'https://content-provider.payshia.com/sapphire-trail/images/tour-8-optimized.webp',
];

function GemStepCard({ step, idx }: { step: any; idx: number }) {
  const Icon = defaultStepIcons[idx % defaultStepIcons.length];
  const img = step.image || defaultStepImages[idx % defaultStepImages.length];
  const stepNum = step.step || `0${idx + 1}`;

  return (
    <div className="group relative bg-card border border-border/80 rounded-2xl overflow-hidden hover:border-[#0B1E38]/40 transition-colors flex flex-col h-full shadow-xs">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20">
        <Image
          src={img}
          alt={step.title}
          fill
          className="object-cover transition-transform duration-500 ease-out md:group-hover:scale-105"
          sizes="(max-width: 768px) 85vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40" />
        <span className="absolute top-3 left-3 bg-black/75 border border-white/20 px-2.5 py-1 rounded-full text-xs font-sans font-medium text-white shadow-sm">
          Stage {stepNum}
        </span>
      </div>

      <div className="p-5 space-y-2.5 flex-1 flex flex-col justify-between font-sans">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[#0B1E38] dark:text-blue-300">
            <Icon className="h-4 w-4" />
            <span className="text-[11px] font-sans uppercase tracking-[0.18em] font-medium">
              Stage {stepNum}
            </span>
          </div>
          <h3 className="font-sans font-semibold text-base sm:text-lg text-foreground group-hover:text-[#0B1E38] dark:group-hover:text-blue-200 transition-colors leading-snug">
            {step.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal pt-1">
            {step.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AboutGemJourney() {
  const { content } = useSiteContent();
  const gemJourney = content.about.gemJourney;
  const steps = gemJourney.steps || [];

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false, 
    align: 'start',
    skipSnaps: true,
    dragFree: false,
    duration: 20,
    containScroll: 'trimSnaps',
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="w-full py-16 md:py-24 bg-background-alt relative overflow-hidden border-t border-border/40">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-18 space-y-3 font-sans">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1E38]/5 dark:bg-white/5 border border-[#0B1E38]/15 dark:border-white/15 text-xs font-medium uppercase tracking-[0.18em] text-[#0B1E38] dark:text-blue-200 shadow-2xs">
            <Gem className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300" />
            <span>{gemJourney.tagline || 'The Geological Magic'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-sans font-bold tracking-tight text-foreground leading-tight">
            {gemJourney.heading || 'The Journey of a Ceylon Sapphire'}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed font-normal max-w-2xl mx-auto">
            {gemJourney.subtitle}
          </p>
        </div>

        {/* Desktop View: 4-Column Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <GemStepCard key={idx} step={step} idx={idx} />
          ))}
        </div>

        {/* Mobile View: Smooth Embla Touch Slider */}
        <div className="md:hidden relative">
          <div className="overflow-hidden -ml-4 touch-pan-y select-none" ref={emblaRef}>
            <div className="flex items-stretch transform-gpu">
              {steps.map((step, idx) => (
                <div key={idx} className="relative flex-[0_0_80%] sm:flex-[0_0_84%] min-w-0 pl-4 flex flex-col">
                  <GemStepCard step={step} idx={idx} />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Indicators */}
          <div className="flex items-center justify-between mt-6 px-1">
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    selectedIndex === i ? "w-6 bg-[#0B1E38] dark:bg-blue-300" : "w-1.5 bg-muted-foreground/30"
                  )}
                  aria-label={`Go to stage ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-sans font-medium uppercase tracking-widest text-muted-foreground">
                0{selectedIndex + 1} / 0{steps.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => emblaApi?.scrollPrev()}
                  disabled={selectedIndex === 0}
                  className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-foreground disabled:opacity-30 transition-opacity active:scale-95"
                  aria-label="Previous step"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => emblaApi?.scrollNext()}
                  disabled={selectedIndex === steps.length - 1}
                  className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-foreground disabled:opacity-30 transition-opacity active:scale-95"
                  aria-label="Next step"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
