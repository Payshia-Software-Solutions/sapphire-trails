'use client';

import Image from 'next/image';
import { MapPin, Crown, Sparkles, Gem, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useSiteContent } from '@/lib/site-content';

export function WhyRatnapuraSection() {
  const { content } = useSiteContent();
  const why = content.about.whyRatnapura;

  return (
    <section className="w-full py-16 md:py-24 bg-background relative overflow-hidden border-t border-border/40">
      <div className="container mx-auto px-4 md:px-6">

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Visual Showcase (5 cols) */}
          <div className="lg:col-span-5 relative space-y-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl border border-border/80 group">
              <Image
                src={why.image || 'https://content-provider.payshia.com/sapphire-trail/images/tour-11-optimized.webp'}
                alt="Panoramic view of Ratnapura gem valley"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-[10px] font-bold text-primary mb-1">
                    <MapPin className="h-3 w-3" /> Sabaragamuwa Province, Sri Lanka
                  </div>
                  <h4 className="text-xl font-bold text-white font-headline">Ratnapura Valley</h4>
                  <p className="text-xs text-slate-300">The world&apos;s oldest active sapphire producing epicenter</p>
                </div>
              </div>
            </div>

            {/* Quick Fact Box */}
            <div className="p-4 rounded-xl bg-card border shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Crown className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-foreground">{why.factTitle || 'Royal Heritage'}</p>
                <p className="text-muted-foreground">{why.factDesc || 'Provider of sapphires to British, European, and Asian royal dynasties for over 2,000 years.'}</p>
              </div>
            </div>
          </div>

          {/* Lore & Story (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              {why.tagline || "The World's Gem Capital"}
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight leading-tight">
              {why.heading}
            </h2>

            <div className="w-20 h-1 bg-primary rounded-full" />

            <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed font-light">
              <p>{why.paragraph1}</p>
              <p>{why.paragraph2}</p>

              {why.quote && (
                <p className="p-4 rounded-xl bg-muted/40 border-l-4 border-primary text-foreground font-serif italic text-base">
                  &ldquo;{why.quote}&rdquo;
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline uppercase tracking-wider"
              >
                Explore Ratnapura Highlights &rarr;
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
