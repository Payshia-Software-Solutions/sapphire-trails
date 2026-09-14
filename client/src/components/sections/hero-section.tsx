"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  CalendarCheck, 
  ChevronDown, 
  Compass, 
  Play, 
  Sparkles,
  X 
} from 'lucide-react';
import { useSiteContent } from '@/lib/site-content';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export function HeroSection() {
  const { content: siteContent } = useSiteContent();
  const heroContent = siteContent.homepage.hero;

  const [isVideoMounted, setIsVideoMounted] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    // Only mount background video if explicitly in video mode
    if (heroContent.heroMode === 'cinematic_video') {
      const timer = setTimeout(() => {
        setIsVideoMounted(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [heroContent.heroMode]);

  const heroMode = heroContent.heroMode || 'editorial_image';
  const tagline = heroContent.tagline || 'THE OFFICIAL SRI LANKA GEM MINE TOUR • RATNAPURA';
  const headlineLine1 = heroContent.headlineLine1 || 'Sri Lanka Gem Mine Tour';
  const headlineLine2 = heroContent.headlineLine2 || 'AN EXCLUSIVE LUXURY EXPERIENCE';
  const subheadline = heroContent.subheadline || "Discover the world's finest Ceylon sapphires with Sri Lanka's premier luxury gem mining tour. Experience active pit descent, traditional gem washing, and private excursions led by licensed gemologists.";
  const ctaPrimary = heroContent.ctaPrimaryText || 'Book Your Experience';
  const ctaSecondary = heroContent.ctaSecondaryText || 'Explore Packages';
  const videoUrl = heroContent.videoUrl || 'https://content-provider.payshia.com/sapphire-trail/hero/hero-video-sapphire-trail.webm';
  const posterImg = heroContent.posterImageUrl || 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp';
  const gemImg = heroContent.gemImageUrl || '/img/hero-sapphire-gem.png';
  const cornerLeft = heroContent.cornerLeftText || 'SAPPHIRE TRAILS • RATNAPURA';
  const cornerCenter = heroContent.cornerCenterText || 'SRI LANKA';
  const cornerRight = heroContent.cornerRightText || '01 / PRIVATE EXPEDITIONS';

  // 1. Cinematic Video Mode (if enabled via CMS)
  if (heroMode === 'cinematic_video') {
    return (
      <section 
        style={{
          minHeight: 'calc(100svh - var(--header-height, 109px))'
        }}
        className="relative w-full flex flex-col items-center justify-center overflow-hidden bg-black px-4 py-8"
      >
        <Image
          src={posterImg}
          alt="A dark, moody gem mine interior"
          fill
          sizes="100vw"
          className="absolute z-0 object-cover"
          priority
        />

        {isVideoMounted && (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onCanPlay={() => setIsVideoVisible(true)}
            className={cn(
              "absolute z-10 w-auto min-w-full min-h-full max-w-none object-cover transition-opacity duration-1000",
              isVideoVisible ? "opacity-100" : "opacity-0"
            )}
          >
            <source src={videoUrl} type="video/webm" />
          </video>
        )}

        <div className="relative z-20 flex flex-col items-center justify-center text-center text-white space-y-4 sm:space-y-5 max-w-4xl mx-auto px-2">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-black/70 border border-white/20 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-primary font-medium">
            <span>{tagline}</span>
          </div>

          <div className="relative w-20 sm:w-24 md:w-28 h-auto flex items-center justify-center">
            <Image
              src="/img/logo4.png"
              alt="Sapphire Trails Logo"
              width={120}
              height={120}
              className="h-auto w-full object-contain drop-shadow-[0_4px_25px_rgba(0,0,0,0.8)]"
              priority
            />
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-bold tracking-tight text-white max-w-4xl leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            <span className="block">{headlineLine1}</span>
            <span className="block text-primary mt-2 sm:mt-3 text-sm sm:text-base md:text-xl lg:text-2xl font-sans font-medium tracking-wider uppercase">
              {headlineLine2}
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 max-w-2xl font-sans font-normal leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {subheadline}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 sm:pt-3 w-full max-w-xs sm:max-w-none font-sans">
            <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-11 sm:h-12 rounded-full shadow-md transition-all">
              <Link href="/booking">
                <CalendarCheck className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {ctaPrimary}
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border border-white/40 bg-black/60 hover:bg-white hover:text-black text-white font-medium px-7 h-11 sm:h-12 rounded-full transition-all">
              <Link href="#tours">
                <Compass className="mr-2 h-4 w-4 text-primary" />
                {ctaSecondary}
              </Link>
            </Button>
          </div>
        </div>

        <Link
          href="#tours"
          className="absolute bottom-2.5 sm:bottom-4 z-20 animate-bounce flex flex-col items-center text-white/70 hover:text-white transition-colors font-sans"
          aria-label="Scroll to next section"
        >
          <span className="text-[10px] uppercase tracking-wider text-white/60 mb-0.5 hidden sm:block font-sans">Explore Packages</span>
          <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </Link>
      </section>
    );
  }

  // 2. Default: Ultra-Fast Minimalist Editorial Sapphire Visual (SEO & Performance Champion)
  return (
    <section 
      style={{
        minHeight: 'calc(100svh - var(--header-height, 109px))'
      }}
      className="relative w-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#FAFBFD] via-white to-[#F4F6F9] dark:from-[#0B1118] dark:via-[#0E1520] dark:to-[#0B1118] px-4 pt-4 sm:pt-6 pb-4 sm:pb-6 transition-colors duration-300"
    >
      {/* Studio Radial Ambient Glow behind the Ceylon Sapphire */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center" aria-hidden="true">
        <div className="w-[500px] sm:w-[750px] md:w-[900px] h-[500px] sm:h-[750px] md:h-[900px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.06)_0%,rgba(218,165,32,0.04)_40%,transparent_70%)] blur-3xl" />
      </div>

      {/* Center Stage: Symmetrically Balanced Editorial Brand & Ceylon Sapphire Ring */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center space-y-5 sm:space-y-6 max-w-6xl mx-auto px-4 w-full my-auto">
        
        {/* Flanking Typography: S A P P H I R E  [ 💎 Ceylon Sapphire Ring ]  T R A I L S */}
        {/* Symmetrical 3-column grid guarantees the gemstone sits at the EXACT 50% center of the screen */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center justify-items-center select-none my-1 sm:my-2">
          {/* Left Wordmark: SAPPHIRE - Aligned to right edge of left column */}
          <div className="w-full flex justify-center sm:justify-end items-center sm:pr-4 md:pr-8 lg:pr-10">
            <span className="font-brand text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-[0.22em] md:tracking-[0.28em] lg:tracking-[0.32em] text-foreground font-light shrink-0">
              SAPPHIRE
            </span>
          </div>

          {/* Center Focal Gemstone Visual - Exactly in true 50% midpoint */}
          <div className="relative my-3 sm:my-0 group cursor-pointer transition-transform duration-500 hover:scale-105 shrink-0 flex justify-center items-center">
            {/* Soft contact shadow beneath the ring */}
            <div 
              className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-3 sm:h-4 bg-primary/25 dark:bg-black/80 rounded-full blur-md" 
              aria-hidden="true" 
            />
            
            <Image
              src={gemImg}
              alt="Authentic Ceylon Blue Sapphire Gemstone Ring - Ratnapura Sri Lanka"
              width={264}
              height={206}
              sizes="(max-width: 640px) 140px, (max-width: 768px) 180px, (max-width: 1024px) 220px, 264px"
              className="relative z-10 w-32 sm:w-40 md:w-48 lg:w-56 xl:w-64 h-auto object-contain drop-shadow-[0_14px_28px_rgba(26,54,93,0.18)] dark:drop-shadow-[0_18px_36px_rgba(0,0,0,0.85)]"
              priority
              fetchPriority="high"
            />
          </div>

          {/* Right Wordmark: TRAILS - Aligned to left edge of right column */}
          <div className="w-full flex justify-center sm:justify-start items-center sm:pl-4 md:pl-8 lg:pl-10">
            <span className="font-brand text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-[0.22em] md:tracking-[0.28em] lg:tracking-[0.32em] text-foreground font-light shrink-0">
              TRAILS
            </span>
          </div>
        </div>

        {/* Subtle Brand Tagline Badge - Placed cleanly beneath the ring */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-primary font-medium font-sans shadow-2xs">
          <span>{tagline}</span>
        </div>

        {/* Semantic H1 for 100% SEO Power (Crawled by Google without visual clutter) */}
        <h1 className="sr-only">
          {headlineLine1} - {headlineLine2} | Sapphire Trails Sri Lanka
        </h1>

        {/* Elegant Editorial Subheadline */}
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto font-sans font-normal leading-relaxed -mt-1 sm:-mt-2">
          {subheadline}
        </p>

        {/* Quiet Luxury Call-To-Action (CTA) Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-xs sm:max-w-none font-sans">
          <Button 
            asChild 
            size="lg" 
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 h-11 sm:h-12 rounded-full shadow-sm transition-all"
          >
            <Link href="/booking">
              <CalendarCheck className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              {ctaPrimary}
            </Link>
          </Button>

          <Button 
            asChild 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto border border-border/90 bg-card/80 hover:bg-muted text-foreground font-medium px-7 h-11 sm:h-12 rounded-full transition-all"
          >
            <Link href="#tours">
              <Compass className="mr-2 h-4 w-4 text-primary" />
              {ctaSecondary}
            </Link>
          </Button>

          {/* Interactive Film Trigger Button - Video remains accessible on demand */}
          {videoUrl && (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => setIsVideoModalOpen(true)}
              className="w-full sm:w-auto text-xs sm:text-sm text-muted-foreground hover:text-primary gap-2 h-11 sm:h-12 rounded-full transition-colors group"
            >
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Play className="h-3.5 w-3.5 fill-primary" />
              </div>
              <span className="font-medium">Watch Film</span>
            </Button>
          )}
        </div>
      </div>

      {/* Editorial Bottom / Corner Meta Strip (Directly from Reference Visual) */}
      <div className="w-full max-w-screen-2xl mx-auto pt-4 px-4 sm:px-8 flex items-center justify-between text-[9px] sm:text-[11px] text-muted-foreground/70 font-sans tracking-widest uppercase select-none">
        <div className="hover:text-foreground transition-colors font-medium">
          {cornerLeft}
        </div>
        <div className="hidden sm:block text-center font-medium">
          {cornerCenter}
        </div>
        <Link 
          href="#tours" 
          className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium cursor-pointer"
        >
          <span>{cornerRight}</span>
          <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary animate-bounce" />
        </Link>
      </div>

      {/* Cinematic Film Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border border-zinc-800 text-white rounded-2xl shadow-2xl">
          <DialogTitle className="sr-only">Sapphire Trails Cinematic Film</DialogTitle>
          <div className="relative aspect-video w-full bg-black">
            {isVideoModalOpen && (
              <video
                src={videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
