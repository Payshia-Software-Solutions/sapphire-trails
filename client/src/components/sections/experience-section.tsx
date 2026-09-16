'use client';

import Image from 'next/image';
import { Gem, BedDouble, Award, Leaf } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useSiteContent } from '@/lib/site-content';

const defaultIcons = [Gem, BedDouble, Award, Leaf];

export function ExperienceSection() {
  const { content } = useSiteContent();
  const exp = content.about.experience;

  return (
    <section className="w-full py-16 md:py-24 bg-background-alt font-sans">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-18 space-y-3">
          {exp.tagline && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1E38]/5 dark:bg-white/5 border border-[#0B1E38]/15 dark:border-white/15 text-xs font-medium uppercase tracking-[0.18em] text-[#0B1E38] dark:text-blue-200 shadow-2xs">
              <span>{exp.tagline}</span>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-sans font-bold tracking-tight text-foreground leading-tight">
            {exp.heading}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed font-normal max-w-2xl mx-auto">
            {exp.description}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {exp.items.map((item, index) => {
            const Icon = defaultIcons[index % defaultIcons.length];
            return (
              <Card key={index} className="overflow-hidden border border-border/80 hover:border-[#0B1E38]/40 transition-colors bg-card rounded-2xl shadow-xs group">
                <div className="relative h-48 w-full overflow-hidden bg-muted/20">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 ease-out md:group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#0B1E38]/5 dark:bg-white/10 text-[#0B1E38] dark:text-blue-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-base sm:text-lg font-sans font-semibold text-foreground leading-snug">{item.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-normal">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
