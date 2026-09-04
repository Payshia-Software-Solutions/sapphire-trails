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
      <div className="container mx-auto px-4 md:px-6">

        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-wider">
            {valuesData.tagline || 'Guiding Principles'}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight">
            {valuesData.heading || 'Rooted in Integrity, Safety & Sustainable Heritage'}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-light">
            {valuesData.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {valuesData.items.map((val, idx) => {
            const Icon = defaultIcons[idx % defaultIcons.length];
            const points = (val.points && val.points.length > 0) ? val.points : defaultPoints[idx % defaultPoints.length];
            return (

              <Card
                key={idx}
                className="bg-card border border-border/70 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group"
              >
                <CardContent className="p-6 sm:p-8 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-primary uppercase tracking-widest px-3 py-1 rounded-full bg-primary/5 border border-primary/20">
                      {val.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-headline font-bold text-foreground">
                      {val.title}
                    </h3>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-light">
                      {val.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/50 space-y-2">
                    {points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2 text-xs text-foreground/80">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
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
