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
const BANNER_HOURLY_IMPRESSIONS_KEY = 'sapphire_banner_hourly_impressions_v1';
const ONE_HOUR_MS = 60 * 60 * 1000;
const MAX_IMPRESSIONS_PER_HOUR = 4;

function getValidHourlyImpressions(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BANNER_HOURLY_IMPRESSIONS_KEY);
    if (!raw) return [];
    const timestamps: number[] = JSON.parse(raw);
    const now = Date.now();
    // Retain only impressions recorded within the last 1 hour
    const valid = timestamps.filter(t => typeof t === 'number' && now - t < ONE_HOUR_MS);
    if (valid.length !== timestamps.length) {
      localStorage.setItem(BANNER_HOURLY_IMPRESSIONS_KEY, JSON.stringify(valid));
    }
    return valid;
  } catch (e) {
    return [];
  }
}

function recordBannerImpression(): void {
  if (typeof window === 'undefined') return;
  try {
    const valid = getValidHourlyImpressions();
    valid.push(Date.now());
    localStorage.setItem(BANNER_HOURLY_IMPRESSIONS_KEY, JSON.stringify(valid));
  } catch (e) {
    // Ignore storage errors
  }
}

export function FeaturedBannerModal() {
  const { content } = useSiteContent();
  const banner: FeaturedBannerConfig = content.settings?.banner || defaultFeaturedBanner;
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  // Target homepage only and exclude admin/auth pages
  const isHomepage = pathname === '/';
  const isAdmin = pathname?.startsWith('/admin') || pathname?.startsWith('/auth');

  useEffect(() => {
    // ONLY display on the Homepage
    if (!isHomepage || isAdmin || !banner.enabled) {
      setIsOpen(false);
      return;
    }

    // Check session dismissal if user already dismissed in this browser session
    const dismissed = sessionStorage.getItem(SESSION_DISMISSED_KEY);
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    // Check 1-hour rate limit: Maximum 4 times per hour
    const recentImpressions = getValidHourlyImpressions();
    if (recentImpressions.length >= MAX_IMPRESSIONS_PER_HOUR) {
      setIsDismissed(true);
      return;
    }

    setIsDismissed(false);

    // Delay before opening
    const delay = Math.max((banner.delaySeconds || 1.5) * 1000, 500);
    const timer = setTimeout(() => {
      // Re-verify rate limit right before display
      const currentImpressions = getValidHourlyImpressions();
      if (currentImpressions.length < MAX_IMPRESSIONS_PER_HOUR) {
        setIsOpen(true);
        recordBannerImpression();
      } else {
        setIsDismissed(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [banner.enabled, banner.delaySeconds, isHomepage, isAdmin]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem(SESSION_DISMISSED_KEY, 'true');
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
      <aside aria-label="Announcement" className="relative z-50 w-full bg-[#0B1E38] text-white border-b border-white/10 py-2 px-4 animate-in slide-in-from-top duration-300 font-sans">
        <div className="container mx-auto max-w-screen-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {banner.badgeText && (
              <Badge className="bg-white/15 text-white border border-white/20 font-medium text-[10px] tracking-wider uppercase">
                {banner.badgeText}
              </Badge>
            )}
            <p className="text-xs sm:text-sm font-normal">
              <strong className="font-semibold text-white mr-1.5">{banner.title}</strong>
              <span className="text-white/80 hidden sm:inline">&mdash; {banner.subtitle}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {banner.primaryButtonText && banner.primaryButtonLink && (
              <Button asChild size="sm" className="h-7 px-3.5 text-xs bg-white hover:bg-white/90 text-[#0B1E38] font-medium rounded-full">
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
  // 2. MINIMALIST LUXURY MODAL & TOAST PRESENTATION
  // ---------------------------------------------------------------------------
  return (
    <div 
      className={cn(
        "fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6 md:p-8 transition-all duration-300",
        displayType === 'bottom_toast' 
          ? "items-end justify-end pointer-events-none p-4 sm:p-6" 
          : "bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget && displayType === 'modal') {
          handleClose();
        }
      }}
    >
      <div 
        className={cn(
          "relative w-full overflow-hidden transition-all duration-300 animate-in zoom-in-95 fade-in-50 rounded-2xl bg-white dark:bg-[#0B1118] text-foreground shadow-[0_25px_70px_rgba(0,0,0,0.35)] border-0",
          displayType === 'bottom_toast' 
            ? "pointer-events-auto max-w-md" 
            : "max-w-3xl lg:max-w-4xl"
        )}
      >
        {/* Sleek Minimal Close Button */}
        <button
          onClick={handleClose}
          className="group absolute top-3.5 right-3.5 z-30 h-8 w-8 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-muted-foreground hover:text-foreground transition-all duration-200"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4 transition-transform group-hover:rotate-90 duration-200" />
        </button>

        {/* Minimal Editorial Horizontal Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch min-h-[340px]">
          
          {/* Left Col: Sharp Crisp Seamless Photo Frame (No Borders) */}
          {banner.image && (
            <div className="md:col-span-5 relative min-h-[200px] md:min-h-[360px] w-full overflow-hidden">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                priority
                className="object-cover object-center transition-transform duration-700 hover:scale-105"
              />
            </div>
          )}

          {/* Right Col: Pure Minimalist Editorial Content */}
          <div className={cn(
            "p-6 sm:p-8 lg:p-9 flex flex-col justify-between space-y-5",
            banner.image ? "md:col-span-7" : "md:col-span-12"
          )}>
            
            <div className="space-y-3">
              {/* Brand Tagline & Badge */}
              {banner.badgeText && (
                <div className="inline-flex items-center px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium tracking-[0.18em] uppercase bg-[#0B1E38]/5 dark:bg-white/5 border border-[#0B1E38]/15 dark:border-white/15 text-[#0B1E38] dark:text-blue-200 font-sans shadow-2xs">
                  {banner.badgeText}
                </div>
              )}

              {/* Main Headline in clean Poppins font-sans */}
              <h3 className="text-xl sm:text-2xl lg:text-[25px] font-sans font-semibold leading-snug tracking-tight text-foreground">
                {banner.title}
              </h3>

              {/* Subtitle / Excerpt in clean Poppins */}
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal font-sans">
                {banner.subtitle}
              </p>
            </div>

            {/* Action Buttons in Signature Navy Blue */}
            <div className="pt-2 flex flex-wrap items-center gap-3 font-sans">
              {banner.primaryButtonText && banner.primaryButtonLink && (
                <Button 
                  asChild 
                  className="h-10 sm:h-11 px-6 sm:px-7 rounded-full text-xs sm:text-sm font-medium tracking-normal bg-[#0B1E38] hover:bg-[#071527] text-white shadow-sm transition-all border border-[#0B1E38]"
                >
                  <Link href={banner.primaryButtonLink} onClick={handleClose}>
                    <span>{banner.primaryButtonText}</span>
                    <ArrowRight className="ml-2 h-3.5 w-3.5 text-white" />
                  </Link>
                </Button>
              )}

              {banner.secondaryButtonText && banner.secondaryButtonLink && (
                <Button 
                  asChild 
                  variant="outline" 
                  className="h-10 sm:h-11 px-5 sm:px-6 rounded-full text-xs sm:text-sm font-medium tracking-normal border border-[#0B1E38]/25 hover:border-[#0B1E38] text-[#0B1E38] hover:bg-[#0B1E38]/5 dark:border-white/20 dark:text-white transition-colors"
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
