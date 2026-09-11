'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  Gem, 
  CalendarCheck, 
  PhoneCall,
  ExternalLink 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSiteContent, type FeaturedBannerConfig, defaultFeaturedBanner } from '@/lib/site-content';
import { cn } from '@/lib/utils';

const SESSION_DISMISSED_KEY = 'sapphire_banner_dismissed_v1';

export function FeaturedBannerModal() {
  const { content } = useSiteContent();
  const banner: FeaturedBannerConfig = content.settings?.banner || defaultFeaturedBanner;
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  // Admin routes should never show the popup modal
  const isAdmin = pathname?.startsWith('/admin') || pathname?.startsWith('/auth');

  useEffect(() => {
    if (isAdmin || !banner.enabled) {
      setIsOpen(false);
      return;
    }

    // Check session dismissal if enabled
    if (banner.showOncePerSession) {
      const dismissed = sessionStorage.getItem(SESSION_DISMISSED_KEY);
      if (dismissed === 'true') {
        setIsDismissed(true);
        return;
      }
    }

    setIsDismissed(false);

    // Delay before opening
    const delay = Math.max((banner.delaySeconds || 1.5) * 1000, 300);
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [banner.enabled, banner.showOncePerSession, banner.delaySeconds, isAdmin, pathname]);

  const handleClose = () => {
    setIsOpen(false);
    if (banner.showOncePerSession) {
      sessionStorage.setItem(SESSION_DISMISSED_KEY, 'true');
    }
  };

  if (isAdmin || !banner.enabled || isDismissed || !isOpen) {
    return null;
  }

  const template = banner.template || 'luxury_gold';
  const displayType = banner.type || 'modal';

  // ---------------------------------------------------------------------------
  // 1. TOP BAR DISPLAY STYLE
  // ---------------------------------------------------------------------------
  if (displayType === 'top_bar') {
    return (
      <aside aria-label="Announcement" className="relative z-50 w-full bg-slate-950 text-white border-b border-primary/30 py-2.5 px-4 animate-in slide-in-from-top duration-300">
        <div className="container mx-auto max-w-screen-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {banner.badgeText && (
              <Badge className="bg-primary text-primary-foreground font-semibold text-[10px] tracking-wider uppercase">
                {banner.badgeText}
              </Badge>
            )}
            <p className="text-xs sm:text-sm font-medium">
              <strong className="text-primary font-serif font-normal mr-1">{banner.title}</strong>
              <span className="text-white/80 hidden sm:inline">&mdash; {banner.subtitle}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {banner.primaryButtonText && banner.primaryButtonLink && (
              <Button asChild size="sm" className="h-7 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                <Link href={banner.primaryButtonLink} onClick={handleClose}>
                  {banner.primaryButtonText}
                </Link>
              </Button>
            )}
            <button
              onClick={handleClose}
              className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. WORLD-CLASS LUXURY PRESENTATION TEMPLATES
  // ---------------------------------------------------------------------------
  return (
    <div 
      className={cn(
        "fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6 md:p-8 transition-all duration-500",
        displayType === 'bottom_toast' 
          ? "items-end justify-end pointer-events-none p-4 sm:p-6" 
          : "bg-black/85 backdrop-blur-md animate-in fade-in-50 duration-300"
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget && displayType === 'modal') {
          handleClose();
        }
      }}
    >
      <div 
        className={cn(
          "relative w-full overflow-hidden transition-all duration-500 animate-in zoom-in-95 fade-in-50",
          displayType === 'bottom_toast' && "pointer-events-auto max-w-md",

          // =========================================================================
          // TEMPLATE 1: LUXURY GOLD — "ROYAL ATELIER" (World-Class Heritage Jewelry)
          // Wide cinematic luxury card with gilded micro-border, deep onyx background & gold serifs
          // =========================================================================
          template === 'luxury_gold' && "max-w-2xl lg:max-w-3xl rounded-2xl bg-[#0B0F15] text-white border border-[#D4AF37]/35 shadow-[0_30px_90px_rgba(0,0,0,0.95)] ring-1 ring-[#D4AF37]/20",

          // =========================================================================
          // TEMPLATE 2: SAPPHIRE ROYAL BLUE — "CEYLON SAPPHIRE VAULT"
          // Majestic midnight sapphire depth, subtle crystal glow, and diamond accents
          // =========================================================================
          template === 'sapphire_blue' && "max-w-2xl lg:max-w-3xl rounded-2xl bg-gradient-to-br from-[#081426] via-[#050C17] to-[#02050A] text-white border border-sky-400/30 shadow-[0_30px_90px_rgba(4,18,45,0.8)] ring-1 ring-sky-400/20",

          // =========================================================================
          // TEMPLATE 3: MINIMAL EDITORIAL — "HAUTE HORLOGERIE / VOGUE EDITORIAL"
          // Crisp, warm Japanese silk/ivory finish, razor-thin framing, pure editorial serif
          // =========================================================================
          template === 'minimal_editorial' && "max-w-2xl lg:max-w-3xl rounded-2xl bg-[#FBF9F5] text-[#14181E] border border-[#E2DDD3] shadow-[0_30px_80px_rgba(0,0,0,0.35)] ring-1 ring-black/5",

          // =========================================================================
          // TEMPLATE 4: IMAGE SPOTLIGHT — "EXPEDITION FULL-BLEED HERO"
          // Full-bleed high-impact luxury travel modal with immersive photography backdrop
          // =========================================================================
          template === 'image_spotlight' && "max-w-xl md:max-w-2xl rounded-2xl bg-[#090D12] text-white border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.95)]"
        )}
      >
        {/* Subtle Hairline Trim */}
        <div className={cn(
          "h-[2px] w-full",
          template === 'luxury_gold' && "bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent",
          template === 'sapphire_blue' && "bg-gradient-to-r from-transparent via-sky-400 to-transparent",
          template === 'minimal_editorial' && "bg-gradient-to-r from-transparent via-amber-700/40 to-transparent",
          template === 'image_spotlight' && "bg-gradient-to-r from-transparent via-white/40 to-transparent"
        )} />

        {/* Sophisticated Micro Close Button */}
        <button
          onClick={handleClose}
          className={cn(
            "group absolute top-4 right-4 z-30 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200",
            template === 'minimal_editorial' 
              ? "bg-black/5 hover:bg-black/10 text-neutral-500 hover:text-black" 
              : "bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
          )}
          aria-label="Close dialog"
        >
          <X className="h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
        </button>

        {/* ===================================================================== */}
        {/* TEMPLATE 4: FULL-BLEED IMMERSIVE EXPEDITION HERO                      */}
        {/* ===================================================================== */}
        {template === 'image_spotlight' ? (
          <div className="relative min-h-[440px] flex flex-col justify-end p-7 sm:p-10 overflow-hidden">
            {banner.image && (
              <div className="absolute inset-0 z-0">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  priority
                  className="object-cover object-center brightness-75 scale-100 hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
              </div>
            )}

            <div className="relative z-10 space-y-4 max-w-xl">
              {banner.badgeText && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-white/20 backdrop-blur-md text-[10px] font-semibold tracking-[0.2em] uppercase text-primary">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span>{banner.badgeText}</span>
                </div>
              )}

              <h3 className="text-2xl sm:text-3xl font-serif font-normal text-white leading-tight tracking-wide drop-shadow-md">
                {banner.title}
              </h3>

              <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-light max-w-lg drop-shadow-sm">
                {banner.subtitle}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {banner.primaryButtonText && banner.primaryButtonLink && (
                  <Button asChild className="h-11 px-7 rounded-full text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg tracking-wide">
                    <Link href={banner.primaryButtonLink} onClick={handleClose}>
                      <span>{banner.primaryButtonText}</span>
                      <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
                {banner.secondaryButtonText && banner.secondaryButtonLink && (
                  <Button asChild variant="outline" className="h-11 px-6 rounded-full text-xs border-white/30 bg-black/40 hover:bg-white hover:text-black text-white backdrop-blur-md transition-colors">
                    <Link 
                      href={banner.secondaryButtonLink} 
                      target={banner.secondaryButtonLink.startsWith('http') ? '_blank' : '_self'}
                      onClick={handleClose}
                    >
                      {banner.secondaryButtonText}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ===================================================================== */
          /* TEMPLATES 1, 2 & 3: WORLD-CLASS LUXURY HORIZONTAL CARD               */
          /* ===================================================================== */
          <div className="grid grid-cols-1 md:grid-cols-12 items-stretch min-h-[380px]">
            
            {/* Left Col: Flawless Photo Frame */}
            {banner.image && (
              <div className="md:col-span-5 relative min-h-[220px] md:min-h-full w-full overflow-hidden bg-black/40">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  priority
                  className="object-cover object-center transition-transform duration-700 hover:scale-105"
                />
                {/* Subtle Luxury Matte Vignette (never washed-out white) */}
                <div className={cn(
                  "absolute inset-0 pointer-events-none",
                  template === 'luxury_gold' && "bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#0B0F15]/10 to-[#0B0F15]",
                  template === 'sapphire_blue' && "bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#050C17]/10 to-[#050C17]",
                  template === 'minimal_editorial' && "bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#FBF9F5]/10 to-[#FBF9F5]"
                )} />
              </div>
            )}

            {/* Right Col: Pure High-End Editorial Content */}
            <div className={cn(
              "p-7 sm:p-9 flex flex-col justify-between space-y-6",
              banner.image ? "md:col-span-7" : "md:col-span-12"
            )}>
              
              <div className="space-y-4">
                {/* Brand Tagline & Badge */}
                <div className="flex items-center gap-2">
                  {banner.badgeText && (
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase",
                      template === 'luxury_gold' && "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30",
                      template === 'sapphire_blue' && "bg-sky-500/10 text-sky-300 border border-sky-400/30",
                      template === 'minimal_editorial' && "bg-[#14181E]/5 text-[#14181E] border border-[#14181E]/15 font-serif"
                    )}>
                      {banner.badgeText}
                    </span>
                  )}
                </div>

                {/* Main Headline */}
                <h3 className={cn(
                  "text-xl sm:text-2xl lg:text-[26px] font-serif font-normal leading-[1.3] tracking-wide",
                  template === 'luxury_gold' && "text-white",
                  template === 'sapphire_blue' && "text-white",
                  template === 'minimal_editorial' && "text-[#14181E]"
                )}>
                  {banner.title}
                </h3>

                {/* Subtitle / Excerpt */}
                <p className={cn(
                  "text-xs sm:text-sm leading-relaxed font-light",
                  template === 'minimal_editorial' ? "text-neutral-600" : "text-white/75"
                )}>
                  {banner.subtitle}
                </p>
              </div>

              {/* Action Buttons: Perfectly Balanced Dual Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {banner.primaryButtonText && banner.primaryButtonLink && (
                  <Button 
                    asChild 
                    className={cn(
                      "h-11 px-7 rounded-full text-xs font-semibold tracking-wider uppercase shadow-md transition-all",
                      template === 'luxury_gold' && "bg-[#D4AF37] hover:bg-[#c29e2e] text-[#0B0F15] hover:shadow-[#D4AF37]/20",
                      template === 'sapphire_blue' && "bg-primary hover:bg-primary/90 text-primary-foreground",
                      template === 'minimal_editorial' && "bg-[#14181E] hover:bg-black text-white"
                    )}
                  >
                    <Link href={banner.primaryButtonLink} onClick={handleClose}>
                      <span>{banner.primaryButtonText}</span>
                      <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}

                {banner.secondaryButtonText && banner.secondaryButtonLink && (
                  <Button 
                    asChild 
                    variant="outline" 
                    className={cn(
                      "h-11 px-6 rounded-full text-xs tracking-wider uppercase transition-colors",
                      template === 'luxury_gold' && "border-white/20 text-white hover:bg-white/10",
                      template === 'sapphire_blue' && "border-sky-400/30 text-sky-200 hover:bg-sky-400/10",
                      template === 'minimal_editorial' && "border-[#14181E]/20 text-[#14181E] hover:bg-[#14181E]/5"
                    )}
                  >
                    <Link 
                      href={banner.secondaryButtonLink} 
                      target={banner.secondaryButtonLink.startsWith('http') ? '_blank' : '_self'}
                      onClick={handleClose}
                    >
                      {banner.secondaryButtonText}
                    </Link>
                  </Button>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
