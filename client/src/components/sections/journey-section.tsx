"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import { Footprints, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteContent } from '@/lib/site-content';
import { cn } from '@/lib/utils';

const default6Steps = [
  {
    step: '01',
    title: 'Introduction to Sri Lankan Gemology',
    subtitle: 'Heritage & Science',
    description: "Discover Sri Lanka's rich gemstone heritage, geological origins, and the legendary history of Ceylon sapphires.",
    image: '/img/journey/journey-1-gemology.webp',
  },
  {
    step: '02',
    title: 'Gem Market Experience',
    subtitle: 'The Trading Bazaar',
    description: "Explore local gem markets and Sri Lanka's vibrant open-air gem trade conducted through secret hand signals.",
    image: '/img/journey/journey-2-market.webp',
  },
  {
    step: '03',
    title: 'Gem Cut & Polishing Experience',
    subtitle: 'Master Lapidary',
    description: "See how rough gemstones become beautiful polished stones under the precision hands of traditional master cutters.",
    image: '/img/journey/journey-3-lapidary.webp',
  },
  {
    step: '04',
    title: 'Gem Museum Visit',
    subtitle: 'Curated Specimens',
    description: "Explore Sri Lanka's fascinating gemstone history, ancient artifacts, and rare natural crystal formations.",
    image: '/img/journey/journey-4-museum.webp',
  },
  {
    step: '05',
    title: 'Gem Mine Experience',
    subtitle: 'Subterranean Pits & Washing',
    description: "Experience a traditional Sri Lankan gem mine. Stand alongside veteran miners washing sapphire gravel in natural mountain streams.",
    image: '/img/journey/journey-5-mine.webp',
  },
  {
    step: '06',
    title: 'Gem & Jewellery Showcase',
    subtitle: 'Haute Joaillerie',
    description: "Discover a curated collection of natural certified Ceylon gemstones and bespoke fine jewelry handcrafted to perfection.",
    image: '/img/journey/journey-6-showcase.webp',
  },
];

function JourneyStepCard({ step, idx }: { step: any; idx: number }) {
  const stepNum = step.step || `0${idx + 1}`;
  const stepImg = step.image || default6Steps[idx % default6Steps.length].image;

  return (
    <div className="group flex flex-col h-full cursor-pointer">
      {/* Tall Immersive Portrait Image Container matching Brochure Pages 04 & 05 */}
      <div className="relative aspect-[4/5] sm:aspect-[341/405] w-full rounded-2xl overflow-hidden bg-white/5 mb-4 shadow-md border border-white/10">
        <Image
          src={stepImg}
          alt={step.title}
          fill
          sizes="(max-width: 768px) 85vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out md:group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080E18]/80 via-transparent to-transparent opacity-60 md:group-hover:opacity-40 transition-opacity" />
        
        {/* Quiet Luxury Step Pill (GPU-friendly high performance) */}
        <div className="absolute top-3 left-3 bg-black/75 border border-white/20 px-3 py-1 rounded-full text-xs font-sans font-medium text-white tracking-widest shadow-sm">
          {stepNum}
        </div>
      </div>

      {/* Editorial Typography & Narrative (Fully Legible, No Truncation) */}
      <div className="flex flex-col flex-grow space-y-1.5 font-sans px-1">
        <p className="text-[11px] uppercase tracking-[0.18em] text-blue-300 font-medium font-sans">
          {step.subtitle || `Stage ${stepNum}`}
        </p>
        
        <h3 className="text-base sm:text-lg lg:text-xl font-sans font-semibold text-white md:group-hover:text-blue-200 transition-colors leading-snug">
          {step.title}
        </h3>
        
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal font-sans pt-0.5">
          {step.description}
        </p>
      </div>
    </div>
  );
}

export function JourneySection() {
  const { content } = useSiteContent();
  const journey = content.homepage.journey;
  const steps = (journey.steps && journey.steps.length >= 6) ? journey.steps : default6Steps;

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
    <section id="journey" className="w-full bg-[#080E18] text-white py-16 md:py-24 lg:py-28 relative overflow-hidden border-y border-white/10">
      {/* Subtle Luxury Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] md:w-[900px] h-[400px] bg-blue-900/15 blur-[140px] pointer-events-none rounded-full" />

      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <ScrollAnimate className="max-w-3xl lg:max-w-4xl mx-auto text-center space-y-3 mb-12 md:mb-18 px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium uppercase tracking-[0.18em] text-blue-200 font-sans shadow-2xs">
            <Footprints className="h-3.5 w-3.5 text-blue-300" />
            {journey.tagline || 'The Signature Gemological Trail'}
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-sans font-bold tracking-tight text-white leading-tight">
            {journey.heading && journey.heading.includes('6-Step') ? journey.heading : 'The 6-Step Gemological Trail'}
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-sans font-normal">
            {journey.subtitle || 'From subterranean timber-reinforced shafts to the world-famous street trading bazaar, experience every stage of authentic Ceylon sapphire heritage.'}
          </p>
        </ScrollAnimate>

        {/* Desktop / Tablet Grid (3 columns x 2 rows) matching Grand Brochure Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-x-5 lg:gap-x-6 gap-y-12 sm:gap-y-16 md:gap-y-20">
          {steps.map((step, idx) => (
            <ScrollAnimate key={idx} className="flex flex-col">
              <JourneyStepCard step={step} idx={idx} />
            </ScrollAnimate>
          ))}
        </div>

        {/* Mobile View Slider - High Performance 60/120fps touch physics */}
        <div className="md:hidden relative">
          <div className="overflow-hidden -ml-4 touch-pan-y select-none" ref={emblaRef}>
            <div className="flex items-stretch transform-gpu">
              {steps.map((step, idx) => (
                <div key={idx} className="relative flex-[0_0_80%] sm:flex-[0_0_84%] min-w-0 pl-4 flex flex-col">
                  <JourneyStepCard step={step} idx={idx} />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Carousel Controls & Progress Indicator */}
          <div className="flex items-center justify-between mt-6 px-1">
            <div className="flex items-center gap-1">
              {steps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => emblaApi?.scrollTo(i)}
                  className="p-2 min-w-[36px] min-h-[44px] flex items-center justify-center cursor-pointer"
                  aria-label={`Go to step ${i + 1}`}
                >
                  <span
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300 block",
                      selectedIndex === i ? "w-6 bg-white" : "w-1.5 bg-white/40"
                    )}
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-sans font-medium uppercase tracking-widest text-slate-400">
                0{selectedIndex + 1} / 0{steps.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollPrev()}
                  disabled={selectedIndex === 0}
                  className="h-10 w-10 min-h-[44px] min-w-[44px] rounded-full border border-white/20 flex items-center justify-center text-white disabled:opacity-30 transition-opacity active:scale-95"
                  aria-label="Previous step"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollNext()}
                  disabled={selectedIndex === steps.length - 1}
                  className="h-10 w-10 min-h-[44px] min-w-[44px] rounded-full border border-white/20 flex items-center justify-center text-white disabled:opacity-30 transition-opacity active:scale-95"
                  aria-label="Next step"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Bottom CTA */}
        <ScrollAnimate className="mt-12 md:mt-20 text-center">
          <Button 
            asChild 
            size="lg" 
            className="bg-white hover:bg-slate-100 text-[#080E18] font-semibold text-xs sm:text-sm h-11 px-8 rounded-full shadow-lg transition-all border border-white"
          >
            <Link href="/tours">
              View All Tour Packages &amp; Bookings
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </ScrollAnimate>

      </div>
    </section>
  );
}
