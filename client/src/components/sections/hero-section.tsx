"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';
import { ScrollAnimate } from '../shared/scroll-animate';
import { cn } from '@/lib/utils';
import { 
  CalendarCheck, 
  ChevronDown, 
  Compass, 
  Sparkles 
} from 'lucide-react';
import { useSiteContent } from '@/lib/site-content';

export function HeroSection() {
  const { content: siteContent } = useSiteContent();
  const heroContent = siteContent.homepage.hero;
  const [isVideoVisible, setIsVideoVisible] = useState(false);

  const tagline = heroContent.tagline || 'THE OFFICIAL SRI LANKA GEM MINE TOUR • RATNAPURA';
  const headlineLine1 = heroContent.headlineLine1 || 'Sri Lanka Gem Mine Tour';
  const headlineLine2 = heroContent.headlineLine2 || 'AN EXCLUSIVE LUXURY EXPERIENCE';
  const subheadline = heroContent.subheadline || "Discover the world's finest Ceylon sapphires with Sri Lanka's premier luxury gem mine tour.";
  const ctaPrimary = heroContent.ctaPrimaryText || 'Book Your Experience';
  const ctaSecondary = heroContent.ctaSecondaryText || 'Explore Packages';
  const videoUrl = heroContent.videoUrl || 'https://content-provider.payshia.com/sapphire-trail/hero/hero-video-sapphire-trail.webm';
  const posterImg = heroContent.posterImageUrl || 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp';

  return (
    <section className="relative h-[calc(100vh-5rem)] min-h-[560px] w-full flex items-center justify-center overflow-hidden bg-black px-4">
      {/* Static poster image */}
      <Image
        src={posterImg}
        alt="A dark, moody gem mine interior"
        fill
        className="absolute z-0 object-cover"
        priority
      />

      {/* Video fades in on top */}
      <video
        autoPlay
        loop
        muted
        playsInline
        onCanPlay={() => setIsVideoVisible(true)}
        className={cn(
          "absolute z-10 w-auto min-w-full min-h-full max-w-none object-cover transition-opacity duration-1000",
          isVideoVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <source src={videoUrl} type="video/webm" />
      </video>

      {/* Lighter Cinematic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/70 z-10 pointer-events-none" />

      {/* Main Hero Center Content */}
      <ScrollAnimate className="relative z-20 flex flex-col items-center justify-center text-center text-white space-y-5 sm:space-y-6 max-w-4xl mx-auto my-auto px-2">
        
        {/* Subtle Brand Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/60 border border-primary/50 backdrop-blur-md text-[11px] sm:text-xs tracking-widest uppercase text-primary animate-in fade-in-0 duration-700 shadow-lg">
          <Sparkles className="h-3 w-3 text-primary" />
          <span>{tagline}</span>
        </div>

        {/* Official Emblem Logo */}
        <div className="relative w-28 sm:w-36 md:w-44 h-auto flex items-center justify-center">
          <Image
            src="/img/logo4.png"
            alt="Sapphire Trails Logo"
            width={180}
            height={180}
            className="h-auto w-full object-contain drop-shadow-[0_4px_25px_rgba(0,0,0,0.8)]"
            priority
          />
        </div>

        {/* Main Headline (2 Separate Structured Lines) */}
        <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tight text-white max-w-5xl leading-tight drop-shadow-[0_2px_15px_rgba(0,0,0,0.85)]">
          <span className="block">{headlineLine1}</span>
          <span className="block text-primary/95 mt-1 sm:mt-2 text-xl sm:text-2xl md:text-4xl lg:text-5xl font-serif font-normal tracking-wide">
            {headlineLine2}
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 max-w-2xl font-body font-light leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
          {subheadline}
        </p>

        {/* Dual Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-xs sm:max-w-none">
          <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-11 sm:h-12 rounded-full shadow-xl shadow-primary/25 transition-transform hover:scale-105">
            <Link href="/booking">
              <CalendarCheck className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              {ctaPrimary}
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-white/40 bg-black/40 hover:bg-white/15 text-white font-medium px-7 h-11 sm:h-12 rounded-full backdrop-blur-md">
            <Link href="#tours">
              <Compass className="mr-2 h-4 w-4 text-primary" />
              {ctaSecondary}
            </Link>
          </Button>
        </div>
      </ScrollAnimate>

      {/* Scroll Down Indicator */}
      <Link
        href="#journey"
        className="absolute bottom-6 sm:bottom-8 z-20 animate-bounce flex flex-col items-center text-white/70 hover:text-white transition-colors"
        aria-label="Scroll to next section"
      >
        <span className="text-[10px] uppercase tracking-widest text-white/60 mb-1 hidden sm:block">Explore Journey</span>
        <ChevronDown className="h-6 w-6 text-primary" />
      </Link>
    </section>
  );
}
