"use client";

import { useState, useRef, TouchEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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

const spreadMeta = [
  {
    key: 'part-1',
    label: 'Part I: The Origin & The Trade',
    badge: 'Stages 01 – 03',
    brochurePage: 'Brochure Page 04',
  },
  {
    key: 'part-2',
    label: 'Part II: The Mine & The Atelier',
    badge: 'Stages 04 – 06',
    brochurePage: 'Brochure Page 05',
  },
];

export function JourneySection() {
  const { content } = useSiteContent();
  const journey = content.homepage.journey;
  const steps = (journey.steps && journey.steps.length >= 6) ? journey.steps : default6Steps;

  const [activeSpread, setActiveSpread] = useState<0 | 1>(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  // Touch gesture handling for smooth mobile swipe
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSwipeLeft = distance > 50;
    const isSwipeRight = distance < -50;

    if (isSwipeLeft && activeSpread === 0) {
      setDirection('right');
      setActiveSpread(1);
    } else if (isSwipeRight && activeSpread === 1) {
      setDirection('left');
      setActiveSpread(0);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const goToSpread = (spread: 0 | 1) => {
    setDirection(spread > activeSpread ? 'right' : 'left');
    setActiveSpread(spread);
  };

  const visibleSteps = activeSpread === 0 ? steps.slice(0, 3) : steps.slice(3, 6);

  return (
    <section id="journey" className="w-full bg-background py-8 sm:py-10 md:py-12 relative overflow-hidden">
      <div 
        className="w-full px-3 sm:px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16 relative z-10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Section Header & Spread Switcher Tabs (All in 1 viewport) */}
        <ScrollAnimate className="max-w-4xl mx-auto text-center space-y-2 mb-6 sm:mb-7 md:mb-8 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#0B1E38]/5 dark:bg-white/5 border border-[#0B1E38]/15 dark:border-white/15 text-[11px] font-medium uppercase tracking-[0.18em] text-[#0B1E38] dark:text-blue-200 font-sans shadow-2xs">
            <Footprints className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300" />
            {journey.tagline || 'The Signature Gemological Trail'}
          </div>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[34px] font-sans font-bold tracking-tight text-foreground leading-tight">
            {journey.heading && journey.heading.includes('6-Step') ? journey.heading : 'The 6-Step Gemological Trail'}
          </h2>

          <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed max-w-2xl mx-auto font-sans font-normal hidden sm:block">
            {journey.subtitle || 'From subterranean timber-reinforced shafts to the world-famous street trading bazaar, experience every stage of authentic Ceylon sapphire heritage.'}
          </p>

          {/* Luxury 2-Spread Switcher Pills & Prev/Next Controls */}
          <div className="flex items-center justify-center gap-2 pt-1 font-sans">
            <div className="inline-flex items-center p-1 rounded-full bg-muted/40 dark:bg-card/40 border border-border/80 shadow-2xs">
              <button
                type="button"
                onClick={() => goToSpread(0)}
                className={cn(
                  "px-3.5 sm:px-4 py-1 rounded-full text-xs font-sans transition-all duration-300",
                  activeSpread === 0
                    ? "bg-[#0B1E38] text-white shadow-xs font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                01–03 • Origin &amp; Trade
              </button>
              <button
                type="button"
                onClick={() => goToSpread(1)}
                className={cn(
                  "px-3.5 sm:px-4 py-1 rounded-full text-xs font-sans transition-all duration-300",
                  activeSpread === 1
                    ? "bg-[#0B1E38] text-white shadow-xs font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                04–06 • Mine &amp; Atelier
              </button>
            </div>

            {/* Quick Arrow Controls */}
            <div className="flex items-center gap-1 ml-1 sm:ml-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => goToSpread(0)}
                disabled={activeSpread === 0}
                className="h-7 w-7 rounded-full border-border/80 hover:border-[#0B1E38] disabled:opacity-30 transition-colors"
                aria-label="Previous 3 steps"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => goToSpread(1)}
                disabled={activeSpread === 1}
                className="h-7 w-7 rounded-full border-border/80 hover:border-[#0B1E38] disabled:opacity-30 transition-colors"
                aria-label="Next 3 steps"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </ScrollAnimate>

        {/* 3-Column Triptych Grid for the Active Spread (Fits 100% in viewport without scroll) */}
        <div 
          key={activeSpread}
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-2.5 sm:gap-x-3.5 md:gap-x-4 gap-y-4 animate-in duration-400 ease-out",
            direction === 'right' ? "slide-in-from-right-3 fade-in-80" : "slide-in-from-left-3 fade-in-80"
          )}
        >
          {visibleSteps.map((step, idx) => {
            const absoluteIdx = activeSpread === 0 ? idx : idx + 3;
            const stepNum = step.step || `0${absoluteIdx + 1}`;
            const stepImg = step.image || default6Steps[absoluteIdx % default6Steps.length].image;

            return (
              <div key={absoluteIdx} className="flex flex-col">
                <div className="group flex flex-col h-full cursor-pointer">
                  
                  {/* Viewport-Calibrated Tall Portrait Image Container (Aspect ~0.84) */}
                  <div className="relative aspect-[4/5] sm:aspect-[341/405] max-h-[34vh] sm:max-h-[38vh] md:max-h-[330px] lg:max-h-[350px] xl:max-h-[370px] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-muted/20 mb-2.5 shadow-xs">
                    <Image
                      src={stepImg}
                      alt={step.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
                    
                    {/* Quiet Luxury Glass Step Pill */}
                    <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium text-white/95 tracking-widest shadow-sm">
                      {stepNum}
                    </div>

                    {/* Brochure Spread Indicator Badge in Top Right */}
                    <div className="absolute top-2.5 right-2.5 bg-black/40 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full text-[9px] font-sans text-white/75 tracking-wider uppercase hidden sm:block">
                      {activeSpread === 0 ? 'Spread 01' : 'Spread 02'}
                    </div>
                  </div>

                  {/* Editorial Typography & Narrative */}
                  <div className="flex flex-col flex-grow space-y-0.5 font-sans px-0.5">
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-[#0B1E38] dark:text-blue-300 font-medium font-sans">
                      {step.subtitle || `Stage ${stepNum}`}
                    </p>
                    
                    <h3 className="text-sm sm:text-base lg:text-lg font-sans font-semibold text-foreground group-hover:text-[#0B1E38] dark:group-hover:text-blue-200 transition-colors leading-snug">
                      {step.title}
                    </h3>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed font-normal font-sans pt-0.5 line-clamp-2 sm:line-clamp-3">
                      {step.description}
                    </p>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Minimalist Bottom Actions & Page Dots */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-4 border-t border-border/60">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans">
            <span className="font-medium text-foreground">{spreadMeta[activeSpread].label}</span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="hidden sm:inline text-muted-foreground/75">{spreadMeta[activeSpread].brochurePage}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => goToSpread(0)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  activeSpread === 0 ? "w-6 bg-[#0B1E38] dark:bg-blue-300" : "w-1.5 bg-muted-foreground/30"
                )}
                aria-label="View Part 1"
              />
              <button
                type="button"
                onClick={() => goToSpread(1)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  activeSpread === 1 ? "w-6 bg-[#0B1E38] dark:bg-blue-300" : "w-1.5 bg-muted-foreground/30"
                )}
                aria-label="View Part 2"
              />
            </div>

            <Button 
              asChild 
              size="sm" 
              className="bg-[#0B1E38] hover:bg-[#071527] text-white font-medium text-xs h-9 px-5 rounded-full shadow-sm transition-all border border-[#0B1E38]"
            >
              <Link href="/tours">
                View Packages
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
}
