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
      {/* Background Image Container - Fits in single mobile screen with hero, full screen on desktop */}
      <div className="relative w-full h-[52svh] min-h-[320px] max-h-[54svh] lg:max-h-none lg:min-h-[calc(100vh-var(--header-height,115px))] lg:h-[calc(100vh-var(--header-height,115px))] flex flex-col justify-between">
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
        <div className="relative z-20 container mx-auto max-w-screen-2xl px-4 sm:px-8 lg:px-12 pt-3 sm:pt-20 pb-2 sm:pb-8 flex-1 flex flex-col justify-center">
          <div className="max-w-xl space-y-1.5 sm:space-y-4">
            {/* Tagline Badge */}
            <div className="text-[9px] sm:text-xs font-semibold tracking-[0.22em] text-[#E8C587] uppercase drop-shadow-sm">
              {tagline}
            </div>

            {/* Main Headline (Poppins font-sans) */}
            <h2 className="font-sans text-lg sm:text-2xl md:text-4xl lg:text-[44px] text-white font-medium sm:font-semibold leading-[1.2] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              {heading}
            </h2>

            {/* Description */}
            <p className="text-[10.5px] sm:text-sm md:text-[15px] text-white/90 max-w-lg font-light leading-snug line-clamp-2 sm:line-clamp-none drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
              {description}
            </p>

            {/* CTA Button */}
            <div className="pt-1 sm:pt-3">
              <Link
                href={ctaLink}
                className="inline-flex items-center gap-1.5 sm:gap-2.5 px-4 sm:px-7 py-1.5 sm:py-3 rounded-full border border-white/70 bg-black/40 hover:bg-white hover:text-black text-white text-[10px] sm:text-sm font-medium tracking-wider uppercase transition-all duration-300 shadow-md backdrop-blur-xs group"
              >
                <span>{ctaText}</span>
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Feature Strip (3 Pillars - Pixel-perfect layout with outline icons & dividers) */}
        <div className="relative z-20 w-full bg-black/80 backdrop-blur-md border-t border-white/15 py-2 sm:py-3.5 px-2 sm:px-6">
          <div className="container mx-auto max-w-screen-2xl grid grid-cols-3 items-center">
            {/* 1. Authentic Experiences */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 px-1 sm:px-3">
              <Gem className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/90 shrink-0" strokeWidth={1.75} />
              <div className="text-[7.5px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.06em] sm:tracking-[0.14em] text-white/95 leading-tight text-left">
                <span className="block">Authentic</span>
                <span className="block">Experiences</span>
              </div>
            </div>

            {/* 2. Expert Guidance (with left & right border dividers) */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 px-1 sm:px-3 border-x border-white/20">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/90 shrink-0" strokeWidth={1.75} />
              <div className="text-[7.5px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.06em] sm:tracking-[0.14em] text-white/95 leading-tight text-left">
                <span className="block">Expert</span>
                <span className="block">Guidance</span>
              </div>
            </div>

            {/* 3. Sustainable Tourism */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 px-1 sm:px-3">
              <Leaf className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/90 shrink-0" strokeWidth={1.75} />
              <div className="text-[7.5px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.06em] sm:tracking-[0.14em] text-white/95 leading-tight text-left">
                <span className="block">Sustainable</span>
                <span className="block">Tourism</span>
              </div>
            </div>
          </div>
        </div>

        {/* Editorial Sub-Footer Corner Navigation Bar */}
        <div className="relative z-20 w-full bg-black/95 py-1.5 sm:py-2.5 px-3 sm:px-8 lg:px-12 border-t border-white/10">
          <div className="container mx-auto max-w-screen-2xl flex items-center justify-between text-[7.5px] sm:text-[10px] md:text-xs text-white/70 font-sans tracking-widest uppercase select-none">
            <div className="hover:text-white transition-colors font-medium">
              {cornerLeft}
            </div>
            <Link 
              href="#tours" 
              className="flex items-center gap-1 text-white/90 hover:text-primary transition-colors font-medium cursor-pointer"
            >
              <span>{cornerRight}</span>
              <ChevronDown className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-[#E8C587] animate-bounce" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
