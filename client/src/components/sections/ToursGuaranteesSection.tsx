'use client';

import { ShieldCheck, Gem, Award, Car, LucideIcon } from 'lucide-react';
import { useSiteContent } from '@/lib/site-content';

const defaultIcons: LucideIcon[] = [ShieldCheck, Gem, Award, Car];

export function ToursGuaranteesSection() {
  const { content } = useSiteContent();
  const guarantees = content.tours.guarantees || [];
  const header = content.tours.guaranteesHeader || {
    tagline: 'The Sapphire Trails Standard',
    heading: "What's Included in Every Private Tour"
  };

  return (
    <section className="w-full py-16 bg-background-alt border-y border-border/80 relative">
      <div className="container mx-auto px-4 md:px-6 max-w-screen-2xl">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary font-serif">
            {header.tagline}
          </span>
          <h2 className="text-2xl sm:text-3xl font-headline font-bold text-foreground">
            {header.heading}
          </h2>
          <div className="w-16 h-1 bg-primary rounded-full mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {guarantees.map((item, index) => {
            const Icon = defaultIcons[index % defaultIcons.length] || ShieldCheck;
            return (
              <div
                key={index}
                className="flex flex-col p-6 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-primary/40 hover:shadow-md transition-all group"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold font-headline text-foreground mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-light">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

