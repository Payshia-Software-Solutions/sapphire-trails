'use client';

import Image from 'next/image';
import { Pickaxe, Waves, Sparkles, Gem } from 'lucide-react';
import { useSiteContent } from '@/lib/site-content';

const defaultStepIcons = [Pickaxe, Waves, Sparkles, Gem];
const defaultStepImages = [
  'https://content-provider.payshia.com/sapphire-trail/images/tour-1-optimized.webp',
  'https://content-provider.payshia.com/sapphire-trail/images/tour-6-optimized.webp',
  'https://content-provider.payshia.com/sapphire-trail/images/tour-7-optimized.webp',
  'https://content-provider.payshia.com/sapphire-trail/images/tour-8-optimized.webp',
];

export function AboutGemJourney() {
  const { content } = useSiteContent();
  const gemJourney = content.about.gemJourney;

  return (
    <section className="w-full py-16 md:py-24 bg-background-alt relative overflow-hidden border-t border-border/40">
      <div className="container mx-auto px-4 md:px-6">

        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary font-serif">
            {gemJourney.tagline || 'The Geological Magic'}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight">
            {gemJourney.heading || 'The Journey of a Ceylon Sapphire'}
          </h2>
          <div className="w-20 h-1 bg-primary rounded-full mx-auto" />
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-light">
            {gemJourney.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {gemJourney.steps.map((step, idx) => {
            const Icon = defaultStepIcons[idx % defaultStepIcons.length];
            const img = step.image || defaultStepImages[idx % defaultStepImages.length];
            return (
              <div
                key={idx}
                className="group relative bg-card border border-border/70 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl flex flex-col justify-between"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={img}
                    alt={step.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                  <span className="absolute top-3 left-3 bg-black/70 border border-primary/40 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-mono font-bold text-primary">
                    STAGE {step.step || `0${idx + 1}`}
                  </span>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-primary">
                      <Icon className="h-4 w-4" />
                      <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                        Stage {step.step || `0${idx + 1}`}
                      </span>
                    </div>
                    <h3 className="font-headline font-bold text-base text-foreground group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-light">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
