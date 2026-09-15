"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import { Footprints, ArrowRight } from 'lucide-react';
import { useSiteContent } from '@/lib/site-content';

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

export function JourneySection() {
  const { content } = useSiteContent();
  const journey = content.homepage.journey;
  const steps = (journey.steps && journey.steps.length >= 6) ? journey.steps : default6Steps;

  return (
    <section id="journey" className="w-full bg-background py-4 sm:py-6 md:py-7 lg:py-8 relative overflow-hidden flex flex-col justify-center min-h-0">
      <div className="w-full px-3 sm:px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16 relative z-10">
        
        {/* Compact Section Header */}
        <ScrollAnimate className="max-w-3xl mx-auto text-center space-y-1 mb-3.5 sm:mb-4 md:mb-5 px-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0B1E38]/5 dark:bg-white/5 border border-[#0B1E38]/15 dark:border-white/15 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.18em] text-[#0B1E38] dark:text-blue-200 font-sans shadow-2xs">
            <Footprints className="h-3 w-3 text-[#0B1E38] dark:text-blue-300" />
            {journey.tagline || 'The Signature Gemological Trail'}
          </div>
          
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-[26px] font-sans font-bold tracking-tight text-foreground leading-tight">
            {journey.heading && journey.heading.includes('6-Step') ? journey.heading : 'The 6-Step Gemological Trail'}
          </h2>

          <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug max-w-xl mx-auto font-sans font-normal hidden sm:block">
            {journey.subtitle || 'From subterranean mines to the world-famous street trading bazaar and bespoke ateliers, experience every stage of Ceylon sapphire heritage.'}
          </p>
        </ScrollAnimate>

        {/* All 6 Steps visible in 2 Rows (3 columns x 2 rows) in 1 Single Viewport */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-2.5 sm:gap-x-3.5 md:gap-x-4 lg:gap-x-4.5 gap-y-3 sm:gap-y-3.5 md:gap-y-4">
          {steps.map((step, idx) => {
            const stepNum = step.step || `0${idx + 1}`;
            const stepImg = step.image || default6Steps[idx % default6Steps.length].image;

            return (
              <div key={idx} className="flex flex-col">
                <div className="group flex flex-col h-full cursor-pointer">
                  
                  {/* Calibrated Height Image Container to guarantee 1-screen fit */}
                  <div className="relative h-28 sm:h-32 md:h-36 lg:h-[150px] xl:h-[162px] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-muted/20 mb-1.5 sm:mb-2 shadow-xs shrink-0">
                    <Image
                      src={stepImg}
                      alt={step.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
                    
                    {/* Quiet Luxury Glass Step Pill */}
                    <div className="absolute top-2 left-2 bg-black/65 backdrop-blur-md border border-white/20 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium text-white/95 tracking-widest shadow-sm">
                      {stepNum}
                    </div>
                  </div>

                  {/* Editorial Typography (Tight line clamp for perfect viewport fit) */}
                  <div className="flex flex-col space-y-0.5 font-sans px-0.5">
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.16em] text-[#0B1E38] dark:text-blue-300 font-medium font-sans truncate">
                      {step.subtitle || `Stage ${stepNum}`}
                    </p>
                    
                    <h3 className="text-xs sm:text-[13px] md:text-sm font-sans font-semibold text-foreground group-hover:text-[#0B1E38] dark:group-hover:text-blue-200 transition-colors leading-snug truncate">
                      {step.title}
                    </h3>
                    
                    <p className="text-[11px] text-muted-foreground leading-snug font-normal font-sans line-clamp-1 sm:line-clamp-2">
                      {step.description}
                    </p>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Compact Bottom CTA */}
        <div className="text-center pt-3 sm:pt-4">
          <Button 
            asChild 
            size="sm" 
            className="bg-[#0B1E38] hover:bg-[#071527] text-white font-medium text-xs h-8 px-6 rounded-full shadow-xs transition-all border border-[#0B1E38]"
          >
            <Link href="/tours">
              View All Tour Packages &amp; Bookings
              <ArrowRight className="ml-1.5 h-3 w-3" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
}
