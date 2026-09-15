"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import { 
  Footprints, 
  ArrowRight, 
  ShieldCheck, 
  Waves, 
  Store, 
  Search,
  CheckCircle2
} from 'lucide-react';
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
    <section id="journey" className="w-full bg-background py-16 md:py-24 lg:py-28 relative overflow-hidden">
      <div className="w-full px-3 sm:px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16 relative z-10">
        
        {/* Section Header */}
        <ScrollAnimate className="max-w-3xl lg:max-w-4xl mx-auto text-center space-y-3 mb-10 md:mb-14 px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1E38]/5 dark:bg-white/5 border border-[#0B1E38]/15 dark:border-white/15 text-xs font-medium uppercase tracking-[0.18em] text-[#0B1E38] dark:text-blue-200 font-sans shadow-2xs">
            <Footprints className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300" />
            {journey.tagline || 'The Signature Gemological Trail'}
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-sans font-bold tracking-tight text-foreground leading-tight">
            {journey.heading && journey.heading.includes('6-Step') ? journey.heading : 'The 6-Step Gemological Trail'}
          </h2>
          
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto font-sans font-normal">
            {journey.subtitle || 'From subterranean mines to the world-famous street trading bazaar and bespoke ateliers, experience every stage of Ceylon sapphire heritage.'}
          </p>
        </ScrollAnimate>

        {/* 6 Steps - Full-Width Narrow-Bezel 3-Column Triptych Grid matching Brochure Pages 04 & 05 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-2 sm:gap-x-3 md:gap-x-3.5 lg:gap-x-4 gap-y-10 sm:gap-y-12 md:gap-y-16">
          {steps.map((step, idx) => {
            const stepNum = step.step || `0${idx + 1}`;
            const stepImg = step.image || default6Steps[idx % default6Steps.length].image;

            return (
              <ScrollAnimate key={idx} className="flex flex-col">
                <div className="group flex flex-col h-full cursor-pointer">
                  
                  {/* Narrow-Bezel Tall Portrait Image Container matching Brochure (Aspect ~0.84) */}
                  <div className="relative aspect-[4/5] sm:aspect-[341/405] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-muted/20 mb-3.5 shadow-xs">
                    <Image
                      src={stepImg}
                      alt={step.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
                    
                    {/* Quiet Luxury Glass Step Pill */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium text-white/95 tracking-widest shadow-sm">
                      {stepNum}
                    </div>
                  </div>

                  {/* Editorial Typography & Narrative */}
                  <div className="flex flex-col flex-grow space-y-1 font-sans px-1">
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-[#0B1E38] dark:text-blue-300 font-medium font-sans">
                      {step.subtitle || `Stage ${stepNum}`}
                    </p>
                    
                    <h3 className="text-base sm:text-lg lg:text-xl font-sans font-semibold text-foreground group-hover:text-[#0B1E38] dark:group-hover:text-blue-200 transition-colors leading-snug">
                      {step.title}
                    </h3>
                    
                    <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed font-normal font-sans pt-0.5">
                      {step.description}
                    </p>
                  </div>

                </div>
              </ScrollAnimate>
            );
          })}
        </div>

        {/* Minimalist Bottom CTA */}
        <ScrollAnimate className="mt-12 md:mt-16 text-center">
          <Button 
            asChild 
            size="lg" 
            className="bg-[#0B1E38] hover:bg-[#071527] text-white font-medium text-xs sm:text-sm h-11 px-8 rounded-full shadow-sm transition-all border border-[#0B1E38]"
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
