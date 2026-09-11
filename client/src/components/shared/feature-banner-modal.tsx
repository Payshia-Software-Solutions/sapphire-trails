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
  // 2. MODAL & BOTTOM TOAST TEMPLATES
  // ---------------------------------------------------------------------------
  return (
    <div 
      className={cn(
        "fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 transition-all duration-300",
        displayType === 'bottom_toast' ? "items-end justify-end pointer-events-none p-4 sm:p-6" : "bg-black/70 backdrop-blur-sm"
      )}
    >
      <div 
        className={cn(
          "relative w-full max-w-lg sm:max-w-xl md:max-w-2xl overflow-hidden rounded-2xl sm:rounded-3xl transition-all duration-300 shadow-2xl animate-in zoom-in-95 fade-in-50",
          displayType === 'bottom_toast' && "pointer-events-auto max-w-md",
          
          // Template 1: Luxury Gold
          template === 'luxury_gold' && "bg-[#0B1118] text-white border-2 border-[#DEC49B]/40 shadow-[0_20px_60px_rgba(0,0,0,0.8)]",
          
          // Template 2: Sapphire Blue
          template === 'sapphire_blue' && "bg-gradient-to-br from-[#0c1e3d] via-[#09152b] to-[#050b14] text-white border border-blue-400/30 shadow-[0_20px_60px_rgba(10,30,70,0.6)]",
          
          // Template 3: Minimal Editorial
          template === 'minimal_editorial' && "bg-background text-foreground border border-border shadow-[0_20px_50px_rgba(0,0,0,0.25)]",
          
          // Template 4: Image Spotlight
          template === 'image_spotlight' && "bg-card text-foreground border border-border/80 shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
        )}
      >
        {/* Top Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 z-30 p-1.5 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/80 backdrop-blur-md transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ----------------- TEMPLATE 4: IMAGE SPOTLIGHT (SPLIT) ----------------- */}
        {template === 'image_spotlight' ? (
          <div className="grid sm:grid-cols-12 items-stretch">
            {/* Image Col */}
            {banner.image && (
              <div className="relative h-48 sm:h-auto sm:col-span-5 w-full min-h-[200px]">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-transparent to-card/90 sm:to-card" />
              </div>
            )}
            
            {/* Content Col */}
            <div className={cn("p-6 sm:p-8 flex flex-col justify-between space-y-4", banner.image ? "sm:col-span-7" : "sm:col-span-12")}>
              <div className="space-y-2.5">
                {banner.badgeText && (
                  <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold tracking-widest uppercase">
                    {banner.badgeText}
                  </Badge>
                )}
                <h3 className="text-xl sm:text-2xl font-serif font-normal text-foreground leading-snug">
                  {banner.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                  {banner.subtitle}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {banner.primaryButtonText && banner.primaryButtonLink && (
                  <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-full h-10 px-6 shadow-sm">
                    <Link href={banner.primaryButtonLink} onClick={handleClose}>
                      <span>{banner.primaryButtonText}</span>
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
                {banner.secondaryButtonText && banner.secondaryButtonLink && (
                  <Button asChild variant="outline" className="text-xs rounded-full h-10 border-border">
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
          /* ----------------- TEMPLATES 1, 2 & 3 ----------------- */
          <div>
            {/* Optional Banner Image Header */}
            {banner.image && (
              <div className="relative h-44 sm:h-52 w-full overflow-hidden">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover"
                />
                <div className={cn(
                  "absolute inset-0",
                  template === 'luxury_gold' && "bg-gradient-to-t from-[#0B1118] via-[#0B1118]/40 to-transparent",
                  template === 'sapphire_blue' && "bg-gradient-to-t from-[#09152b] via-[#09152b]/40 to-transparent",
                  template === 'minimal_editorial' && "bg-gradient-to-t from-background via-background/30 to-transparent"
                )} />

                {/* Floating Tag over Image */}
                {banner.badgeText && (
                  <div className="absolute bottom-4 left-6 z-10">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase border backdrop-blur-md",
                      template === 'luxury_gold' && "bg-black/70 text-[#DEC49B] border-[#DEC49B]/30",
                      template === 'sapphire_blue' && "bg-blue-950/70 text-blue-200 border-blue-400/30",
                      template === 'minimal_editorial' && "bg-background/90 text-primary border-primary/20"
                    )}>
                      {banner.badgeText}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Content Body */}
            <div className="p-6 sm:p-8 space-y-5">
              {!banner.image && banner.badgeText && (
                <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-semibold tracking-widest uppercase bg-primary/10 text-primary border border-primary/20">
                  {banner.badgeText}
                </span>
              )}

              <div className="space-y-2 text-center sm:text-left">
                <h3 className={cn(
                  "text-xl sm:text-2xl md:text-3xl font-serif font-normal leading-tight",
                  template === 'luxury_gold' && "text-[#DEC49B]",
                  template === 'sapphire_blue' && "text-white",
                  template === 'minimal_editorial' && "text-foreground"
                )}>
                  {banner.title}
                </h3>
                <p className={cn(
                  "text-xs sm:text-sm leading-relaxed max-w-xl",
                  template === 'luxury_gold' && "text-white/80 font-light",
                  template === 'sapphire_blue' && "text-blue-100/80 font-light",
                  template === 'minimal_editorial' && "text-muted-foreground font-light"
                )}>
                  {banner.subtitle}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
                {banner.primaryButtonText && banner.primaryButtonLink && (
                  <Button 
                    asChild 
                    className={cn(
                      "w-full sm:w-auto h-11 px-7 rounded-full text-xs font-semibold shadow-md transition-all",
                      template === 'luxury_gold' && "bg-[#DEC49B] hover:bg-[#c9af85] text-[#0B1118]",
                      template === 'sapphire_blue' && "bg-primary hover:bg-primary/90 text-primary-foreground",
                      template === 'minimal_editorial' && "bg-primary hover:bg-primary/90 text-primary-foreground"
                    )}
                  >
                    <Link href={banner.primaryButtonLink} onClick={handleClose}>
                      <span>{banner.primaryButtonText}</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}

                {banner.secondaryButtonText && banner.secondaryButtonLink && (
                  <Button 
                    asChild 
                    variant="outline" 
                    className={cn(
                      "w-full sm:w-auto h-11 px-6 rounded-full text-xs transition-colors",
                      template === 'luxury_gold' && "border-white/20 text-white hover:bg-white/10",
                      template === 'sapphire_blue' && "border-blue-300/30 text-white hover:bg-blue-400/10",
                      template === 'minimal_editorial' && "border-border text-foreground hover:bg-muted"
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
