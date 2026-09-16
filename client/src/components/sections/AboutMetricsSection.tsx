'use client';

import { Award, Gem, ShieldCheck, Star } from 'lucide-react';
import { useSiteContent } from '@/lib/site-content';

const metricIcons = [Award, ShieldCheck, Gem, Star];

export function AboutMetricsSection() {
  const { content } = useSiteContent();
  const metricsData = content.about.metrics;

  return (
    <section className="w-full py-10 bg-card border-y border-border/80 relative z-20 font-sans">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricsData.map((metric, index) => {
            const Icon = metricIcons[index % metricIcons.length];
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-5 rounded-2xl bg-background border border-border/80 hover:border-[#0B1E38]/30 transition-colors group shadow-xs"
              >
                <div className="h-12 w-12 rounded-xl bg-[#0B1E38]/5 dark:bg-white/10 text-[#0B1E38] dark:text-blue-300 flex items-center justify-center shrink-0 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-sans font-bold text-foreground tracking-tight">
                    {metric.value}
                  </p>
                  <p className="text-xs font-sans font-semibold text-[#0B1E38] dark:text-blue-300 uppercase tracking-wider">
                    {metric.label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed font-normal">
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
