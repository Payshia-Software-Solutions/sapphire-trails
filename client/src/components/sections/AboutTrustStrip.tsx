'use client';

import { ShieldCheck, Award, FileCheck2, Building2 } from 'lucide-react';
import { useSiteContent } from '@/lib/site-content';

export function AboutTrustStrip() {
  const { content } = useSiteContent();
  const trust = content.about.trustStrip;

  return (
    <section className="w-full py-12 bg-background-alt border-y border-border/60">
      <div className="container mx-auto px-4 md:px-6">

        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary font-serif">
            Recognized &amp; Certified
          </p>
          <h3 className="text-xl sm:text-2xl font-bold font-headline text-foreground mt-1">
            {trust.heading || 'Government Compliance & International Standards'}
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="p-4 rounded-xl bg-card border flex flex-col items-center text-center space-y-2 shadow-2xs">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-xs text-foreground">NGJA Licensed</h4>
            <p className="text-[11px] text-muted-foreground">
              {trust.badge1 || 'National Gem & Jewellery Authority certified operations'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border flex flex-col items-center text-center space-y-2 shadow-2xs">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-xs text-foreground">SLTDA Compliant</h4>
            <p className="text-[11px] text-muted-foreground">
              {trust.badge2 || 'Sri Lanka Tourism Development Authority recognized safety'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border flex flex-col items-center text-center space-y-2 shadow-2xs">
            <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-xs text-foreground">GIA Grading Standards</h4>
            <p className="text-[11px] text-muted-foreground">
              {trust.badge3 || 'Gemological Institute of America standard color & clarity evaluation'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border flex flex-col items-center text-center space-y-2 shadow-2xs">
            <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-xs text-foreground">27-Yr Hospitality Base</h4>
            <p className="text-[11px] text-muted-foreground">
              {trust.badge4 || 'Exclusively hosted by Grand Silver Ray Luxury Resort'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
