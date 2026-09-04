'use client';

import React from 'react';
import { Compass, Gem, Sparkles, Hammer, Truck } from 'lucide-react';
import { useSiteContent } from '@/lib/site-content';

const defaultTimelineIcons = [Compass, Gem, Sparkles, Hammer, Truck];

export function ProposalJourneyTimeline() {
  const { content } = useSiteContent();
  const timeline = content.proposal?.timeline;
  const stepsList = timeline?.steps || [];

  return (
    <section className="w-full py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-headline font-bold text-primary">
            {timeline?.heading || 'From Mine To Ring In 5 Days'}
          </h2>
          <h3 className="font-serif text-lg tracking-[0.2em] text-primary/80 uppercase">
            {timeline?.tagline || 'The 5-Stage Journey'}
          </h3>
          <div className="w-24 h-px bg-primary mx-auto"></div>
          <p className="text-muted-foreground leading-relaxed mt-4">
            {timeline?.subtitle || 'A seamless romantic experience where you source your dream gemstone together at the origin and have it custom-crafted by master jewelers in 5 working days.'}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-0">
          {stepsList.map((item, index) => {
            const Icon = defaultTimelineIcons[index % defaultTimelineIcons.length];
            const isLast = index === stepsList.length - 1;

            return (
              <div key={index} className="relative flex gap-6">
                {/* Time + vertical line */}
                <div className="flex flex-col items-center">
                  <div className="flex flex-col items-center justify-center shrink-0 w-24 pt-1 text-center">
                    <span className="text-sm font-bold text-primary font-serif leading-tight">{item.time}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">{item.step}</span>
                  </div>
                  {!isLast && (
                    <div className="w-px flex-1 bg-border mt-3 min-h-[50px]" />
                  )}
                </div>

                {/* Content Card */}
                <div className={`flex-1 pb-8 ${isLast ? 'pb-0' : ''}`}>
                  <div className="p-6 rounded-lg bg-card border border-border/80 shadow-sm hover:border-primary/40 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-md bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-headline font-bold text-foreground text-lg">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mt-2">{item.description}</p>
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

