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
    <section className="w-full py-16 bg-background-alt border-y border-border/80 relative font-sans">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1E38]/5 dark:bg-white/5 border border-[#0B1E38]/15 dark:border-white/15 text-xs font-medium uppercase tracking-[0.18em] text-[#0B1E38] dark:text-blue-200 shadow-2xs">
            <span>{header.tagline}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold tracking-tight text-foreground leading-tight">
            {header.heading}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {guarantees.map((item, index) => {
            const Icon = defaultIcons[index % defaultIcons.length] || ShieldCheck;
            return (
              <div
                key={index}
                className="flex flex-col p-6 rounded-2xl bg-card border border-border/80 hover:border-[#0B1E38]/40 transition-all group shadow-xs"
              >
                <div className="h-12 w-12 rounded-xl bg-[#0B1E38]/5 dark:bg-white/10 text-[#0B1E38] dark:text-blue-300 flex items-center justify-center mb-4 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-sans font-semibold text-foreground mb-1 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
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

