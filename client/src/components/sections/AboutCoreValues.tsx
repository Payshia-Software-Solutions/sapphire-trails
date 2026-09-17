'use client';

import { HeartHandshake, Trees, ShieldCheck, Award, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useSiteContent } from '@/lib/site-content';

const defaultIcons = [HeartHandshake, Trees, ShieldCheck, Award];

const defaultPoints = [
  ['100% Government Licensed Pits (NGJA)', 'Direct artisan profit sharing', 'Strict zero child-labor policy'],
  ['Zero chemical mining methods', 'Paddy field & waterway preservation', 'Active tree replanting initiatives'],
  ['Safety helmets, harnesses & boots provided', 'Structural pit safety inspection', '24/7 Concierge & medical backup'],
  ['Independent laboratory testing', 'Conflict-free origin verification', 'Transparent valuation & pricing'],
];

export function AboutCoreValues() {
  const { content } = useSiteContent();
  const valuesData = content.about.values;

  return (
    <section className="w-full py-16 md:py-24 bg-background relative border-t border-border/40">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-18 space-y-3 font-sans">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1E38]/5 dark:bg-white/5 border border-[#0B1E38]/15 dark:border-white/15 text-xs font-medium uppercase tracking-[0.18em] text-[#0B1E38] dark:text-blue-200 shadow-2xs">
            <HeartHandshake className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300" />
            <span>{valuesData.tagline || 'Guiding Principles'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-sans font-bold tracking-tight text-foreground leading-tight">
            {valuesData.heading || 'Rooted in Integrity, Safety & Sustainable Heritage'}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed font-normal max-w-2xl mx-auto">
            {valuesData.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 font-sans">
          {valuesData.items.map((val, idx) => {
            const Icon = defaultIcons[idx % defaultIcons.length];
            const points = (val.points && val.points.length > 0) ? val.points : defaultPoints[idx % defaultPoints.length];
            return (

              <Card
                key={idx}
                className="bg-card border border-border/80 hover:border-[#0B1E38]/40 transition-colors group rounded-2xl shadow-xs"
              >
                <CardContent className="p-6 sm:p-8 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-[#0B1E38]/5 dark:bg-white/10 text-[#0B1E38] dark:text-blue-300 flex items-center justify-center transition-all">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-medium text-[#0B1E38] dark:text-blue-200 uppercase tracking-widest px-3 py-1 rounded-full bg-[#0B1E38]/5 dark:bg-white/5 border border-[#0B1E38]/15 dark:border-white/15">
                      {val.badge}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-sans font-semibold text-foreground leading-snug">
                      {val.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                      {val.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/50 space-y-2">
                    {points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2 text-xs text-foreground/80 font-normal">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300 shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
}
