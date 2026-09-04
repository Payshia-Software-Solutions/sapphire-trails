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
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          {exp.tagline && (
            <span className="text-xs font-semibold uppercase tracking-widest text-primary font-serif">
              {exp.tagline}
            </span>
          )}
          <h2 className="text-3xl font-headline font-bold text-primary">{exp.heading}</h2>
          <p className="mt-4 text-muted-foreground md:text-xl/relaxed font-light">{exp.description}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {exp.items.map((item, index) => {
            const Icon = defaultIcons[index % defaultIcons.length];
            return (
              <Card key={index} className="overflow-hidden border-border/60 hover:shadow-lg transition-shadow">
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
                    <h3 className="text-xl font-headline font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
