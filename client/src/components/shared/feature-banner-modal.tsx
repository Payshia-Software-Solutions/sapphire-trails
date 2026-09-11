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
  // 2. MODAL & BOTTOM TOAST TEMPLATES (QUIET LUXURY 5-STAR DESIGN)
  // ---------------------------------------------------------------------------
  return (
    <div 
      className={cn(
        "fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 transition-all duration-300",
        displayType === 'bottom_toast' 
          ? "items-end justify-end pointer-events-none p-4 sm:p-6" 
          : "bg-black/80 backdrop-blur-md animate-in fade-in-50 duration-300"
      )}
      onClick={(e) => {
        // Click backdrop to dismiss
        if (e.target === e.currentTarget && displayType === 'modal') {
          handleClose();
        }
      }}
    >
      <div 
        className={cn(
          "relative w-full max-w-xl md:max-w-2xl overflow-hidden rounded-2xl sm:rounded-3xl transition-all duration-300 shadow-[0_25px_70px_rgba(0,0,0,0.85)] animate-in zoom-in-95 fade-in-50",
          displayType === 'bottom_toast' && "pointer-events-auto max-w-md",
          
          // Template 1: Luxury Gold (Signature Velvet Midnight Slate)
          template === 'luxury_gold' && "bg-[#0c1117] text-white border border-[#DEC49B]/35",
          
          // Template 2: Sapphire Blue (Deep Royal Gem)
          template === 'sapphire_blue' && "bg-[#09152b] text-white border border-blue-400/30",
          
          // Template 3: Minimal Editorial (Warm Silk Ivory)
          template === 'minimal_editorial' && "bg-[#FDFBF7] text-[#1a1a1a] border border-[#E4DEC8]",
          
          // Template 4: Image Spotlight
          template === 'image_spotlight' && "bg-[#0f1722] text-white border border-border/80"
        )}
      >
        {/* Subtle Decorative Gold Accent Strip */}
        <div className={cn(
          "h-1 w-full bg-gradient-to-r",
          template === 'luxury_gold' && "from-transparent via-[#DEC49B] to-transparent",
          template === 'sapphire_blue' && "from-transparent via-blue-400 to-transparent",
          template === 'minimal_editorial' && "from-transparent via-primary/60 to-transparent",
          template === 'image_spotlight' && "from-transparent via-amber-400 to-transparent"
        )} />

        {/* Top Micro Close Button */}
        <button
          onClick={handleClose}
          className={cn(
            "absolute top-3.5 right-3.5 z-30 h-8 w-8 rounded-full flex items-center justify-center transition-all",
            template === 'minimal_editorial' 
              ? "bg-black/5 hover:bg-black/10 text-neutral-600 hover:text-black" 
              : "bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
          )}
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Card Inner Grid: Clean Split Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-12 items-stretch">
          
          {/* Left Column: Authentic Clean Photo Frame (No white washout gradient) */}
          {banner.image && (
            <div className="sm:col-span-5 relative min-h-[220px] sm:min-h-full w-full overflow-hidden bg-black/40">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover object-center transition-transform duration-700 hover:scale-105"
              />
              {/* Subtle edge vignette that stays deep/clean */}
              <div className={cn(
                "absolute inset-0 pointer-events-none",
                template === 'minimal_editorial' 
                  ? "sm:bg-gradient-to-r sm:from-transparent sm:to-[#FDFBF7]/40 bg-gradient-to-t from-[#FDFBF7] to-transparent sm:from-transparent" 
                  : "sm:bg-gradient-to-r sm:from-transparent sm:to-[#0c1117]/60 bg-gradient-to-t from-[#0c1117] to-transparent sm:from-transparent"
              )} />
            </div>
          )}

          {/* Right Column: Refined Typography & Action Controls */}
          <div className={cn(
            "p-6 sm:p-7 flex flex-col justify-between space-y-5",
            banner.image ? "sm:col-span-7" : "sm:col-span-12"
          )}>
            
            <div className="space-y-3">
              {/* Badge */}
              {banner.badgeText && (
                <div className="inline-flex items-center gap-1.5">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.15em] uppercase",
                    template === 'luxury_gold' && "bg-[#DEC49B]/15 text-[#DEC49B] border border-[#DEC49B]/30",
                    template === 'sapphire_blue' && "bg-blue-500/15 text-blue-300 border border-blue-400/30",
                    template === 'minimal_editorial' && "bg-primary/10 text-primary border border-primary/20",
                    template === 'image_spotlight' && "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  )}>
                    {banner.badgeText}
                  </span>
                </div>
              )}

              {/* Title */}
              <h3 className={cn(
                "text-lg sm:text-xl font-serif font-normal leading-snug tracking-wide",
                template === 'luxury_gold' && "text-white",
                template === 'sapphire_blue' && "text-white",
                template === 'minimal_editorial' && "text-[#1a1a1a]",
                template === 'image_spotlight' && "text-white"
              )}>
                {banner.title}
              </h3>

              {/* Subtitle */}
              <p className={cn(
                "text-xs leading-relaxed font-light",
                template === 'minimal_editorial' ? "text-neutral-600" : "text-white/70"
              )}>
                {banner.subtitle}
              </p>
            </div>

            {/* Action Buttons: Responsive & Flex-Wrap (Never Cut Off) */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {banner.primaryButtonText && banner.primaryButtonLink && (
                <Button 
                  asChild 
                  className={cn(
                    "h-10 px-5 rounded-full text-xs font-semibold shadow-md transition-all shrink-0",
                    template === 'luxury_gold' && "bg-[#DEC49B] hover:bg-[#cbb085] text-[#0B1118]",
                    template === 'sapphire_blue' && "bg-primary hover:bg-primary/90 text-primary-foreground",
                    template === 'minimal_editorial' && "bg-primary hover:bg-primary/90 text-primary-foreground",
                    template === 'image_spotlight' && "bg-primary hover:bg-primary/90 text-primary-foreground"
                  )}
                >
                  <Link href={banner.primaryButtonLink} onClick={handleClose}>
                    <span>{banner.primaryButtonText}</span>
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}

              {banner.secondaryButtonText && banner.secondaryButtonLink && (
                <Button 
                  asChild 
                  variant="outline" 
                  className={cn(
                    "h-10 px-4 rounded-full text-xs transition-colors shrink-0",
                    template === 'minimal_editorial' 
                      ? "border-neutral-300 text-neutral-800 hover:bg-neutral-100" 
                      : "border-white/20 text-white/90 hover:text-white hover:bg-white/10"
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

      </div>
    </div>
  );
}
