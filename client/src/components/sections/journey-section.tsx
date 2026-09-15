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

const defaultStepImages = [
  "https://content-provider.payshia.com/sapphire-trail/images/tour-3-optimized.webp",
  "https://content-provider.payshia.com/sapphire-trail/images/tour-4-optimized.webp",
  "https://content-provider.payshia.com/sapphire-trail/images/tour-7-optimized.webp",
  "https://content-provider.payshia.com/sapphire-trail/images/tour-8-optimized.webp",
];

export function JourneySection() {
  const { content } = useSiteContent();
  const journey = content.homepage.journey;

  return (
    <section id="journey" className="w-full bg-background py-16 md:py-24 lg:py-28 relative overflow-hidden">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <ScrollAnimate className="max-w-3xl lg:max-w-4xl mx-auto text-center space-y-3 mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1E38]/5 dark:bg-white/5 border border-[#0B1E38]/15 dark:border-white/15 text-xs font-medium uppercase tracking-[0.18em] text-[#0B1E38] dark:text-blue-200 font-sans shadow-2xs">
            <Footprints className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300" />
            {journey.tagline || 'The Signature Gemological Trail'}
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-sans font-bold tracking-tight text-foreground leading-tight">
            {journey.heading || 'The 4-Step Expedition Journey'}
          </h2>
          
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto font-sans font-normal">
            {journey.subtitle || 'From subterranean timber-reinforced shafts to the world-famous street trading bazaar, experience every stage of Ceylon sapphire heritage.'}
          </p>
        </ScrollAnimate>

        {/* 4 Steps - Clean Editorial Minimalist Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 lg:gap-8 xl:gap-9">
          {journey.steps.map((step, idx) => {
            const stepNum = step.step || `0${idx + 1}`;
            const stepImg = step.image || defaultStepImages[idx % defaultStepImages.length];

            return (
              <ScrollAnimate key={idx} className="flex flex-col">
                <div className="group flex flex-col h-full cursor-pointer">
                  
                  {/* Minimalist Image Container with Soft Rounded Corners */}
                  <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-muted/30 mb-4 shadow-xs">
                    <Image
                      src={stepImg}
                      alt={step.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 group-hover:opacity-25 transition-opacity" />
                    
                    {/* Quiet Luxury Glass Step Pill */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium text-white/95 tracking-widest shadow-sm">
                      {stepNum}
                    </div>
                  </div>

                  {/* Editorial Typography & Narrative (Zero Clutter) */}
                  <div className="flex flex-col flex-grow space-y-1.5 font-sans">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#0B1E38] dark:text-blue-300 font-medium font-sans">
                      {step.subtitle || `Stage ${stepNum}`}
                    </p>
                    
                    <h3 className="text-base sm:text-lg font-sans font-semibold text-foreground group-hover:text-[#0B1E38] dark:group-hover:text-blue-200 transition-colors leading-snug">
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
