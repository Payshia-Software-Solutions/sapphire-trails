"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  CalendarCheck, 
  ChevronDown, 
  Compass 
} from 'lucide-react';
import { useSiteContent } from '@/lib/site-content';

export function HeroSection() {
  const { content: siteContent } = useSiteContent();
  const heroContent = siteContent.homepage.hero;
  const [isVideoMounted, setIsVideoMounted] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);

  useEffect(() => {
    // Defer loading heavy background video until initial LCP and FCP paint complete
    const timer = setTimeout(() => {
      setIsVideoMounted(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const tagline = heroContent.tagline || 'THE OFFICIAL SRI LANKA GEM MINE TOUR • RATNAPURA';
  const headlineLine1 = heroContent.headlineLine1 || 'Sri Lanka Gem Mine Tour';
  const headlineLine2 = heroContent.headlineLine2 || 'AN EXCLUSIVE LUXURY EXPERIENCE';
  const subheadline = heroContent.subheadline || "Discover the world's finest Ceylon sapphires with Sri Lanka's premier luxury gem mine tour.";
  const ctaPrimary = heroContent.ctaPrimaryText || 'Book Your Experience';
  const ctaSecondary = heroContent.ctaSecondaryText || 'Explore Packages';
  const videoUrl = heroContent.videoUrl || 'https://content-provider.payshia.com/sapphire-trail/hero/hero-video-sapphire-trail.webm';
  const posterImg = heroContent.posterImageUrl || 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp';

  return (
    <section 
      style={{
        height: 'calc(100svh - var(--header-height, 109px))',
        minHeight: 'calc(100svh - var(--header-height, 109px))'
      }}
      className="relative w-full flex flex-col items-center justify-center overflow-hidden bg-black px-4 py-6"
    >
      {/* Static poster image - High Priority LCP */}
      <Image
        src={posterImg}
        alt="A dark, moody gem mine interior"
        fill
        sizes="100vw"
        className="absolute z-0 object-cover"
        priority
      />

      {/* Video fades in on top after LCP content is established */}
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

      {/* Main Hero Center Content - Rendered immediately with zero opacity delay for instant FCP/LCP */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center text-white space-y-4 sm:space-y-5 max-w-4xl mx-auto px-2">
        
        {/* Subtle Brand Tag */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-black/70 border border-white/20 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-primary font-medium">
          <span>{tagline}</span>
        </div>

        {/* Official Emblem Logo */}
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

        {/* Main Headline */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-bold tracking-tight text-white max-w-4xl leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          <span className="block">{headlineLine1}</span>
          <span className="block text-primary mt-2 sm:mt-3 text-sm sm:text-base md:text-xl lg:text-2xl font-sans font-medium tracking-wider uppercase">
            {headlineLine2}
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 max-w-2xl font-sans font-normal leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {subheadline}
        </p>

        {/* Dual Call to Action Buttons */}
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

      {/* Scroll Down Indicator */}
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
