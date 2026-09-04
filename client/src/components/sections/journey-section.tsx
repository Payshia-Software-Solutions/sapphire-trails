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

const defaultHighlights = [
  ["Safety harnesses & helmets provided", "Licensed government pits", "Expert guidance at every step"],
  ["Keep raw minerals you uncover", "Traditional wicker basket technique", "Natural mountain spring location"],
  ["Exclusive market access", "Experience traditional trading rituals", "Bespoke collector negotiations"],
  ["Microscopic crystal inspection", "Official authenticity certificates", "Custom jewellery design consultation"],
];

export function JourneySection() {
  const { content } = useSiteContent();
  const journey = content.homepage.journey;

  return (
    <section id="journey" className="w-full bg-background py-16 md:py-28 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <ScrollAnimate className="max-w-3xl mx-auto text-center space-y-3 mb-14 md:mb-18">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold uppercase tracking-wider text-primary">
            <Footprints className="h-3.5 w-3.5" />
            {journey.tagline || 'The Signature Gem Mine Tour Experience'}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary">
            {journey.heading || 'The 4-Step Gem Mine Tour Journey'}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {journey.subtitle || 'Unlike standard tourist stops, Sapphire Trails takes you deep into the authentic lifecycle of Ceylon Sapphires.'}
          </p>
        </ScrollAnimate>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {journey.steps.map((step, idx) => (
            <ScrollAnimate key={idx} className="flex">
              <div className="group relative w-full bg-background-alt border border-border/80 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1.5">
                
                {/* Image Container */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden">
                  <Image
                    src={defaultStepImages[idx % defaultStepImages.length]}
                    alt={step.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-alt via-background-alt/30 to-transparent" />
                  
                  {/* Step Number Badge */}
                  <div className="absolute top-3 left-3 bg-black/70 border border-primary/40 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-mono font-bold text-primary">
                    STEP {step.step || `0${idx + 1}`}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between space-y-4">
                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-widest text-primary font-semibold font-serif">
                      {step.subtitle}
                    </p>
                    <h3 className="text-base sm:text-lg font-headline font-bold text-foreground group-hover:text-primary transition-colors sm:min-h-[3.25rem] flex items-center">
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Feature Highlights */}
                  <div className="space-y-1.5 pt-3 border-t border-border/60">
                    {(defaultHighlights[idx] || []).map((h, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </ScrollAnimate>
          ))}
        </div>

        {/* Bottom CTA Strip */}
        <ScrollAnimate className="mt-14 text-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 rounded-full shadow-lg">
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
