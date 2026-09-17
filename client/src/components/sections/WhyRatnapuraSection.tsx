'use client';

import Image from 'next/image';
import { MapPin, Crown, Gem, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useSiteContent } from '@/lib/site-content';

export function WhyRatnapuraSection() {
  const { content } = useSiteContent();
  const why = content.about.whyRatnapura;

  return (
    <section className="w-full py-16 md:py-24 bg-background relative overflow-hidden border-t border-border/40 font-sans">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Visual Showcase (5 cols) */}
          <div className="lg:col-span-5 relative space-y-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/80 group">
              <Image
                src={why.image || 'https://content-provider.payshia.com/sapphire-trail/images/tour-11-optimized.webp'}
                alt="Panoramic view of Ratnapura gem valley"
                fill
                className="object-cover transition-transform duration-500 ease-out md:group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-[10px] font-medium text-white mb-1 shadow-xs">
                    <MapPin className="h-3 w-3" /> Sabaragamuwa Province, Sri Lanka
                  </div>
                  <h4 className="text-xl font-sans font-semibold text-white">Ratnapura Valley</h4>
                  <p className="text-xs text-slate-300 font-normal">The world&apos;s oldest active sapphire producing epicenter</p>
                </div>
              </div>
            </div>

            {/* Quick Fact Box */}
            <div className="p-4 rounded-xl bg-card border border-border/80 flex items-center gap-4 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-[#0B1E38]/5 text-[#0B1E38] dark:bg-white/10 dark:text-blue-300 flex items-center justify-center shrink-0">
                <Crown className="h-5 w-5" />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-semibold text-foreground">{why.factTitle || 'Royal Heritage'}</p>
                <p className="text-muted-foreground leading-relaxed font-normal">{why.factDesc || 'Provider of sapphires to British, European, and Asian royal dynasties for over 2,000 years.'}</p>
              </div>
            </div>
          </div>

          {/* Lore & Story (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1E38]/5 dark:bg-white/5 border border-[#0B1E38]/15 dark:border-white/15 text-xs font-medium uppercase tracking-[0.18em] text-[#0B1E38] dark:text-blue-200 shadow-2xs">
              <Crown className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300" />
              <span>{why.tagline || "The World's Gem Capital"}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-sans font-bold tracking-tight text-foreground leading-tight">
              {why.heading}
            </h2>

            <div className="space-y-4 text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed font-normal">
              <p>{why.paragraph1}</p>
              <p>{why.paragraph2}</p>

              {why.quote && (
                <p className="p-4 rounded-xl bg-muted/40 border-l-4 border-[#0B1E38] text-foreground font-sans italic text-xs sm:text-sm md:text-base">
                  &ldquo;{why.quote}&rdquo;
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Link
                href="/explore-ratnapura"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#0B1E38] dark:text-blue-300 hover:underline uppercase tracking-wider"
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
