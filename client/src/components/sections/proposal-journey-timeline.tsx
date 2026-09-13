'use client';

import React from 'react';
import { Compass, Gem, Award, Hammer, Truck } from 'lucide-react';
import { useSiteContent } from '@/lib/site-content';

const defaultTimelineIcons = [Compass, Gem, Award, Hammer, Truck];

export function ProposalJourneyTimeline() {
  const { content } = useSiteContent();
  const timeline = content.proposal?.timeline;
  const stepsList = timeline?.steps || [];

  return (
    <section className="w-full py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary font-serif">
            {timeline?.tagline || 'The 5-Stage Journey'}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-wide text-foreground">
            {timeline?.heading || 'From Mine To Ring In 5 Days'}
          </h2>
          <p className="text-muted-foreground leading-relaxed mt-2 font-light text-sm sm:text-base">
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
                  <div className="p-6 rounded-2xl bg-card border border-border/80 hover:border-primary/40 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-serif font-medium text-foreground text-base sm:text-lg">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-light mt-2">{item.description}</p>
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

