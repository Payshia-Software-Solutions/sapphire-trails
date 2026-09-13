'use client';

import { Award, Gem, ShieldCheck, Star } from 'lucide-react';
import { useSiteContent } from '@/lib/site-content';

const metricIcons = [Award, ShieldCheck, Gem, Star];

export function AboutMetricsSection() {
  const { content } = useSiteContent();
  const metricsData = content.about.metrics;

  return (
    <section className="w-full py-10 bg-card border-y border-border/80 relative z-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricsData.map((metric, index) => {
            const Icon = metricIcons[index % metricIcons.length];
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-5 rounded-2xl bg-background border border-border/60 hover:border-primary/50 transition-colors group"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-serif font-normal text-foreground tracking-wide">
                    {metric.value}
                  </p>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {metric.label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed font-light">
                    {metric.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
