'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Gem, Users, Leaf } from 'lucide-react';
import { useSiteContent } from '@/lib/site-content';

export function MineDescentSection() {
  const { content } = useSiteContent();
  const heroContent = content?.homepage?.hero;
  const mineData = heroContent?.mineSection;

  if (mineData?.enabled === false) {
    return null;
  }

  const imageUrl = mineData?.imageUrl || '/img/gem-mine-descent.jpg';
  const tagline = mineData?.tagline || 'DESCEND BENEATH RATNAPURA';
  const heading = mineData?.heading || "Where Sri Lanka's sapphires begin.";
  const description = mineData?.description || "Join local miners and expert gemologists for a hands-on journey into Sri Lanka's rich gem mining heritage.";
  const ctaText = mineData?.ctaText || 'DISCOVER THE EXPERIENCE';
  const ctaLink = mineData?.ctaLink || '#tours';
  const cornerLeft = heroContent?.cornerLeftText || 'SAPPHIRE TRAILS • RATNAPURA';
  const cornerRight = heroContent?.cornerRightText || '01 / PRIVATE EXPEDITIONS';

  return (
    <section className="relative w-full overflow-hidden font-sans text-white border-t border-border/20">
      {/* Background Image Container - Full page on desktop, compact & immersive on mobile */}
      <div className="relative w-full min-h-[480px] sm:min-h-[540px] lg:min-h-[calc(100vh-var(--header-height,115px))] lg:h-[calc(100vh-var(--header-height,115px))] flex flex-col justify-between">
        <Image
          src={imageUrl}
          alt="Descending into an authentic timber gem mine pit in Ratnapura Sri Lanka"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_top] sm:object-center select-none"
        />

        {/* Cinematic Vignette & Gradient Overlays for High-Contrast Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/30 z-10" />

        {/* Content Box */}
        <div className="relative z-20 container mx-auto max-w-screen-2xl px-5 sm:px-8 lg:px-12 pt-14 sm:pt-20 pb-8 flex-1 flex flex-col justify-center">
          <div className="max-w-xl space-y-3.5 sm:space-y-4">
            {/* Tagline Badge */}
            <div className="text-[11px] sm:text-xs font-semibold tracking-[0.24em] text-[#E8C587] uppercase drop-shadow-sm">
              {tagline}
            </div>

            {/* Serif Main Headline */}
            <h2 className="font-brand text-2xl sm:text-3xl md:text-4xl lg:text-[44px] text-white font-normal leading-[1.2] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              {heading}
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm md:text-[15px] text-white/90 max-w-lg font-light leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
              {description}
            </p>

            {/* CTA Button */}
            <div className="pt-2 sm:pt-3">
              <Link
                href={ctaLink}
                className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full border border-white/70 bg-black/40 hover:bg-white hover:text-black text-white text-xs sm:text-sm font-medium tracking-wider uppercase transition-all duration-300 shadow-md backdrop-blur-xs group"
              >
                <span>{ctaText}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Feature Strip (3 Pillars) */}
        <div className="relative z-20 w-full bg-black/65 backdrop-blur-md border-t border-white/15 py-3 sm:py-4 px-4 sm:px-8">
          <div className="container mx-auto max-w-screen-2xl grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-6 items-center">
            {/* 1. Authentic Experiences */}
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-[#E8C587] shrink-0 border border-white/10">
                <Gem className="h-4 w-4" />
              </div>
              <span className="text-[11px] sm:text-xs tracking-[0.16em] uppercase font-medium text-white/95">
                Authentic Experiences
              </span>
            </div>

            {/* 2. Expert Guidance */}
            <div className="flex items-center justify-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-[#E8C587] shrink-0 border border-white/10">
                <Users className="h-4 w-4" />
              </div>
              <span className="text-[11px] sm:text-xs tracking-[0.16em] uppercase font-medium text-white/95">
                Expert Guidance
              </span>
            </div>

            {/* 3. Sustainable Tourism */}
            <div className="flex items-center justify-center sm:justify-end gap-3">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-[#E8C587] shrink-0 border border-white/10">
                <Leaf className="h-4 w-4" />
              </div>
              <span className="text-[11px] sm:text-xs tracking-[0.16em] uppercase font-medium text-white/95">
                Sustainable Tourism
              </span>
            </div>
          </div>
        </div>

        {/* Editorial Sub-Footer Corner Navigation Bar */}
        <div className="relative z-20 w-full bg-black/90 py-2.5 px-4 sm:px-8 lg:px-12 border-t border-white/10">
          <div className="container mx-auto max-w-screen-2xl flex items-center justify-between text-[9px] sm:text-[10px] md:text-xs text-white/70 font-sans tracking-widest uppercase select-none">
            <div className="hover:text-white transition-colors font-medium">
              {cornerLeft}
            </div>
            <Link 
              href="#tours" 
              className="flex items-center gap-1.5 text-white/90 hover:text-primary transition-colors font-medium cursor-pointer"
            >
              <span>{cornerRight}</span>
              <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#E8C587] animate-bounce" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
