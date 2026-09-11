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
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-4xl mx-auto mb-14 space-y-3">
          {exp.tagline && (
            <span className="text-xs font-semibold uppercase tracking-widest text-primary font-serif">
              {exp.tagline}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-wide text-foreground">{exp.heading}</h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed font-light max-w-3xl md:max-w-4xl mx-auto">{exp.description}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {exp.items.map((item, index) => {
            const Icon = defaultIcons[index % defaultIcons.length];
            return (
              <Card key={index} className="overflow-hidden border border-border/70 hover:border-primary/50 transition-colors bg-card">
                <div className="relative h-48 w-full">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-serif font-medium text-foreground">{item.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-light">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
