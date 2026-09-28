"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { 
  CalendarCheck, 
  ChevronDown, 
  Compass, 
  Play, 
  Sparkles,
  Volume2,
  VolumeX,
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
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasVideoError, setHasVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isVideoModalOpen) {
      setIsVideoLoading(true);
      setHasVideoError(false);
      setIsMuted(true);
    }
  }, [isVideoModalOpen]);

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
  const mountainImg = heroContent.mountainImageUrl || '/img/hero-misty-mountains.jpg';
  const storiesTagline = heroContent.storiesTagline || 'PEOPLE • PLACES • PRECIOUS STORIES';
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
            <Button asChild size="lg" className="w-full sm:w-auto bg-[#0B1E38] hover:bg-[#071527] text-white font-medium px-8 h-11 sm:h-12 rounded-full shadow-md transition-all border border-[#0B1E38]">
              <Link href="/booking">
                <CalendarCheck className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" />
                {ctaPrimary}
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border border-white/40 bg-black/60 hover:bg-white hover:text-black text-white font-medium px-7 h-11 sm:h-12 rounded-full transition-all">
              <Link href="#tours">
                <Compass className="mr-2 h-4 w-4 text-white" />
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
          <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </Link>
      </section>
    );
  }

  // 2. Default: Ultra-Fast Minimalist Editorial Sapphire Visual (SEO & Performance Champion)
  return (
    <section 
      className="relative w-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#FAFBFD] via-white to-[#F4F6F9] dark:from-[#0B1118] dark:via-[#0E1520] dark:to-[#0B1118] px-3 sm:px-4 pt-1.5 sm:pt-6 pb-1.5 sm:pb-5 transition-colors duration-300 h-[48svh] min-h-[300px] max-h-[50svh] lg:max-h-none lg:h-[calc(100vh-var(--header-height,115px))] lg:min-h-[calc(100vh-var(--header-height,115px))]"
    >
      {/* Studio Radial Ambient Glow behind the Ceylon Sapphire */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-10" aria-hidden="true">
        <div className="w-[500px] sm:w-[750px] md:w-[900px] h-[500px] sm:h-[750px] md:h-[900px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.06)_0%,rgba(218,165,32,0.04)_40%,transparent_70%)] blur-3xl" />
      </div>

      {/* Misty Ratnapura Mountain Range Background (Smooth top fade) */}
      <div className="absolute inset-x-0 bottom-0 h-[40%] sm:h-[48%] md:h-[52%] pointer-events-none z-0 overflow-hidden select-none">
        <Image
          src={mountainImg}
          alt="Misty tropical mountains and rainforest of Ratnapura Sri Lanka"
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom opacity-85 dark:opacity-35 transition-opacity duration-700"
        />
        {/* Soft gradient mask blending the image seamlessly into the header background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFBFD] via-[#FAFBFD]/60 via-30% to-transparent dark:from-[#0B1118] dark:via-[#0B1118]/70" />
      </div>

      {/* Center Stage: Proportioned Sapphire Gem on Top with SAPPHIRE TRAILS Unified Headline */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center space-y-1.5 sm:space-y-3.5 md:space-y-4 lg:space-y-5 max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-2 sm:px-4 w-full my-auto">
        
        {/* 1. Ceylon Sapphire Gem Visual on Top - Calibrated height to prevent viewport overflow */}
        <div className="relative group cursor-pointer transition-transform duration-500 hover:scale-105 flex justify-center items-center">
          {/* Soft contact shadow beneath the loose gemstones */}
          <div 
            className="absolute -bottom-1 sm:-bottom-1.5 md:-bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-2 sm:h-3.5 md:h-4 bg-primary/20 dark:bg-black/80 rounded-full blur-md" 
            aria-hidden="true" 
          />
          
          <Image
            src={gemImg}
            alt="Natural Loose Ceylon Precious Gemstones - Royal Blue Sapphire, Ruby, Pushparaga and Padparadscha - Ratnapura Sri Lanka"
            width={1194}
            height={517}
            sizes="(max-width: 640px) 140px, (max-width: 1024px) 380px, 520px"
            className="relative z-10 w-28 sm:w-56 md:w-80 lg:w-[440px] xl:w-[490px] max-h-[8.5vh] sm:max-h-[18vh] lg:max-h-[24vh] h-auto object-contain drop-shadow-[0_8px_20px_rgba(26,54,93,0.16)] dark:drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)]"
            priority
            fetchPriority="high"
          />
        </div>

        {/* 2. Unified Brand Headline: SAPPHIRE TRAILS (Strict Single-Line Grand Wordmark) */}
        <h1 className="font-brand text-lg sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.85rem] 2xl:text-[4.25rem] tracking-[0.16em] sm:tracking-[0.22em] md:tracking-[0.24em] xl:tracking-[0.25em] text-foreground font-light select-none uppercase whitespace-nowrap">
          SAPPHIRE TRAILS
        </h1>

        {/* 3. Subtle Brand Tagline Badge */}
        <div className="inline-flex items-center px-2.5 sm:px-4.5 py-0.5 sm:py-1.5 rounded-full bg-[#0B1E38]/5 dark:bg-white/5 border border-[#0B1E38]/15 dark:border-white/15 text-[8.5px] sm:text-[11px] md:text-xs tracking-[0.16em] sm:tracking-[0.2em] md:tracking-[0.22em] uppercase text-[#0B1E38] dark:text-blue-200 font-medium font-sans shadow-2xs">
          <span>{tagline}</span>
        </div>

        {/* 4. Elegant Editorial Subheadline */}
        <p className="text-[10.5px] sm:text-sm md:text-base text-muted-foreground max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto font-sans font-normal leading-snug sm:leading-relaxed line-clamp-3 sm:line-clamp-none">
          {subheadline}
        </p>

        {/* 5. Quiet Luxury Call-To-Action (CTA) Group in Signature Navy Blue */}
        <div className="flex flex-row items-center justify-center gap-1.5 sm:gap-3.5 md:gap-4 pt-0.5 sm:pt-2 w-full max-w-sm sm:max-w-none font-sans">
          <Button 
            asChild 
            className="flex-1 sm:flex-initial bg-[#0B1E38] hover:bg-[#071527] text-white font-medium h-8 sm:h-11 md:h-12 lg:h-[50px] xl:h-[54px] px-3 sm:px-7 md:px-8 lg:px-9 xl:px-10 rounded-full shadow-md transition-all border border-[#0B1E38] text-[10.5px] sm:text-sm md:text-[15px] lg:text-base"
          >
            <Link href="/booking">
              <CalendarCheck className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-[18px] md:w-[18px] lg:h-5 lg:w-5 text-white" />
              {ctaPrimary}
            </Link>
          </Button>

          <Button 
            asChild 
            variant="outline" 
            className="flex-1 sm:flex-initial border border-[#0B1E38]/30 hover:border-[#0B1E38] bg-white/80 dark:bg-card/80 hover:bg-[#0B1E38]/5 text-[#0B1E38] dark:text-white dark:border-white/20 font-medium h-8 sm:h-11 md:h-12 lg:h-[50px] xl:h-[54px] px-3 sm:px-7 md:px-8 lg:px-9 xl:px-10 rounded-full transition-all text-[10.5px] sm:text-sm md:text-[15px] lg:text-base"
          >
            <Link href="#tours">
              <Compass className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-[18px] md:w-[18px] lg:h-5 lg:w-5 text-[#0B1E38] dark:text-blue-300" />
              {ctaSecondary}
            </Link>
          </Button>

          {/* Interactive Film Trigger Button - Video remains accessible on demand */}
          {videoUrl && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsVideoModalOpen(true)}
              className="text-[10px] sm:text-sm md:text-[15px] lg:text-base text-muted-foreground hover:text-[#0B1E38] dark:hover:text-white gap-1.5 sm:gap-2.5 h-8 sm:h-11 md:h-12 lg:h-[50px] xl:h-[54px] px-2 sm:px-5 md:px-6 lg:px-7 rounded-full transition-colors group shrink-0"
            >
              <div className="h-5 w-5 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full bg-[#0B1E38]/10 dark:bg-white/10 flex items-center justify-center text-[#0B1E38] dark:text-white group-hover:scale-110 transition-transform">
                <Play className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 fill-[#0B1E38] dark:fill-white" />
              </div>
              <span className="font-medium hidden xs:inline sm:inline">Watch Film</span>
            </Button>
          )}
        </div>

        {/* 6. Editorial Tagline: PEOPLE • PLACES • PRECIOUS STORIES */}
        <div className="pt-0.5 sm:pt-3 text-[8.5px] sm:text-xs tracking-[0.2em] sm:tracking-[0.28em] uppercase text-[#8C7A5B] dark:text-[#D4B98E] font-medium font-sans select-none drop-shadow-xs">
          {storiesTagline}
        </div>
      </div>

      {/* Editorial Bottom / Corner Meta Strip (Desktop Viewport Closer) */}
      <div className="hidden lg:flex w-full max-w-screen-2xl mx-auto pt-1 pb-1 sm:pb-2 px-4 sm:px-8 lg:px-12 items-center justify-between text-[9px] sm:text-[10px] md:text-xs text-muted-foreground/70 font-sans tracking-widest uppercase select-none">
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

      {/* Enhanced Luxury Cinematic Film Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-4xl w-[94vw] sm:w-[90vw] p-0 overflow-hidden bg-black border border-white/15 text-white rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] [&>button]:z-50 [&>button]:text-white [&>button]:bg-black/70 [&>button]:hover:bg-black [&>button]:p-2 [&>button]:rounded-full [&>button]:border [&>button]:border-white/20 [&>button]:top-3 [&>button]:right-3 [&>button]:transition-all">
          <DialogTitle className="sr-only">Sapphire Trails Cinematic Film</DialogTitle>
          <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
            {/* Top Luxury Branding Ribbon */}
            <div className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-4 bg-gradient-to-b from-black/85 via-black/35 to-transparent flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] sm:text-xs tracking-[0.22em] uppercase text-white/90 font-medium font-sans drop-shadow-sm">
                  Sapphire Trails • Cinematic Expedition
                </span>
              </div>
            </div>

            {isVideoModalOpen && (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  poster={posterImg}
                  controls
                  autoPlay
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  onWaiting={() => setIsVideoLoading(true)}
                  onPlaying={() => setIsVideoLoading(false)}
                  onCanPlay={() => {
                    setIsVideoLoading(false);
                    videoRef.current?.play().catch(() => {
                      if (videoRef.current) {
                        videoRef.current.muted = true;
                        setIsMuted(true);
                        videoRef.current.play().catch(() => {});
                      }
                    });
                  }}
                  onError={() => {
                    setIsVideoLoading(false);
                    setHasVideoError(true);
                  }}
                  className="w-full h-full object-cover sm:object-contain bg-black"
                >
                  <source src={videoUrl} type="video/webm" />
                </video>

                {/* Loading Spinner with Luxury Gem Glow */}
                {isVideoLoading && !hasVideoError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs z-20 pointer-events-none transition-opacity duration-300">
                    <div className="relative flex items-center justify-center">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary absolute animate-pulse" />
                    </div>
                    <span className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-white/90 font-medium font-sans mt-3">
                      Loading Ceylon Film...
                    </span>
                  </div>
                )}

                {/* Error Fallback */}
                {hasVideoError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 p-6 text-center">
                    <p className="text-xs sm:text-sm text-white/90 font-medium mb-3">
                      Video stream could not load on this connection.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setHasVideoError(false);
                        setIsVideoLoading(true);
                        if (videoRef.current) {
                          videoRef.current.load();
                          videoRef.current.play().catch(() => {});
                        }
                      }}
                      className="border-white/20 text-white bg-white/10 hover:bg-white/20 rounded-full text-xs"
                    >
                      Retry Playback
                    </Button>
                  </div>
                )}

                {/* One-Tap Sound Toggle Pill */}
                {!hasVideoError && (
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-30">
                    <button
                      type="button"
                      onClick={() => {
                        if (videoRef.current) {
                          const nextMuted = !videoRef.current.muted;
                          videoRef.current.muted = nextMuted;
                          setIsMuted(nextMuted);
                        }
                      }}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black text-white text-[10px] sm:text-xs font-medium border border-white/20 shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                      aria-label={isMuted ? "Unmute video" : "Mute video"}
                    >
                      {isMuted ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-white/80" />
                          <span className="tracking-wider uppercase text-[9px] sm:text-[10px]">Tap For Sound</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-primary" />
                          <span className="tracking-wider uppercase text-[9px] sm:text-[10px]">Sound On</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
