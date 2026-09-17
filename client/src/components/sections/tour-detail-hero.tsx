'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Star, 
  ArrowRight, 
  Users, 
  Shield, 
  MessageCircle, 
  Calendar, 
  Gem, 
  Compass,
  CheckCircle2,
  Maximize2,
  ChevronRight,
  Sparkles
} from 'lucide-react';

import { getFullImageUrl } from '@/lib/utils';
import type { GalleryImage, PricingTier, TourInclusion } from '@/lib/packages-data';
import { useSiteContent, getWhatsappUrl } from '@/lib/site-content';
import { trackViewTour } from '@/lib/analytics';

interface TourDetailHeroProps {
  title: string;
  duration: string;
  price: string;
  priceSuffix: string;
  pricingTiers?: PricingTier[];
  imageUrl: string;
  imageHint: string;
  bookingLink: string;
  galleryImages?: GalleryImage[];
  inclusions?: TourInclusion[];
  category?: string;
}

const FALLBACK_HERO_IMAGE = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop&q=80';

export function TourDetailHero({
  title,
  duration,
  price,
  priceSuffix,
  pricingTiers = [],
  imageUrl,
  imageHint,
  bookingLink,
  galleryImages = [],
  inclusions = [],
  category = 'Gem Mine Tours'
}: TourDetailHeroProps) {
  const { content } = useSiteContent();
  const initialImage = getFullImageUrl(imageUrl) || FALLBACK_HERO_IMAGE;
  const [selectedImage, setSelectedImage] = useState<string>(initialImage);

  // Collect available thumbnails for quick switching
  const allThumbnails = [
    { src: initialImage, alt: title },
    ...(galleryImages || []).slice(0, 3).map((g, i) => ({
      src: getFullImageUrl(g.src) || FALLBACK_HERO_IMAGE,
      alt: g.alt || `Tour photo ${i + 1}`
    }))
  ].filter((v, i, a) => a.findIndex(t => t.src === v.src) === i); // unique

  const hasTiers = Boolean(pricingTiers && pricingTiers.length > 0);
  const perPersonTiers = (pricingTiers || []).filter(t => t.pricing_type === 'per_person');
  const lowestTierPrice = perPersonTiers.length > 0 ? Math.min(...perPersonTiers.map(t => t.price)) : null;
  const startingDisplayPrice = hasTiers && lowestTierPrice !== null ? `$${lowestTierPrice}` : price;
  const startingSuffix = hasTiers ? 'per person' : (priceSuffix || 'per person');

  // Track Tour View in GA4 (view_item) and Meta Pixel (ViewContent)
  useEffect(() => {
    const rawPrice = (typeof price === 'string') ? price.replace(/[^0-9.]/g, '') : '';
    const numericPrice = parseFloat(rawPrice) || (lowestTierPrice || 150);
    trackViewTour({
      id: title,
      name: title,
      price: numericPrice,
      category: category || 'Gem Mine Tours',
    });
  }, [title, price, category, lowestTierPrice]);

  return (
    <section id="overview" className="relative w-full py-8 sm:py-12 lg:py-20 bg-background border-b border-border/80 overflow-hidden">
      <div className="container relative z-10 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation - Unified site-wide */}
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground mb-6 font-sans">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          <Link href="/tours" className="hover:text-foreground transition-colors">Gem Mine Tours</Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-md">{title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center font-sans">

          
          {/* LEFT 7 COLS: TEXT CONTENT & ACTIONS */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B1E38]/5 dark:bg-white/5 border border-[#0B1E38]/15 dark:border-white/15 text-xs font-semibold uppercase tracking-[0.16em] text-[#0B1E38] dark:text-blue-200 shadow-2xs">
                <Gem className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#0B1E38] dark:text-blue-300" />
                <span>{category || 'Gem Mine Tours'}</span>
              </div>

              <div className="flex items-center gap-1 bg-background-alt border border-border px-2.5 py-1 rounded-full text-[11px] sm:text-xs text-foreground shadow-2xs">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1 text-[10px] sm:text-[11px] font-semibold text-muted-foreground">5.0 Star</span>
              </div>
            </div>

            {/* Tour Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-sans font-bold text-foreground leading-[1.2] sm:leading-[1.15] tracking-tight">
              {title}
            </h1>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
              <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-border bg-background-alt px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-foreground shadow-xs">
                <Clock className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300" />
                <span>{duration || 'Full Day'}</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-border bg-background-alt px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-foreground shadow-xs">
                <Shield className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300" />
                <span>Safety Certified</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-border bg-background-alt px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-foreground shadow-xs">
                <Users className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300" />
                <span>Master Gemologist Guided</span>
              </div>
            </div>

            {/* Dedicated Luxury Pricing Block */}
            <div className="rounded-2xl border border-border bg-card/70 dark:bg-card/40 backdrop-blur-sm p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground block">
                    {hasTiers ? 'Starting Rate' : 'Package Rate'}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl sm:text-4xl font-extrabold font-sans tracking-tight text-[#0B1E38] dark:text-blue-200">
                      {startingDisplayPrice}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                      / {startingSuffix.replace(/^\/?(per\s*)?/i, '') || 'person'}
                    </span>
                  </div>
                </div>

                {hasTiers ? (
                  <div className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-xs font-semibold">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Group Rates Available</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1 rounded-full bg-[#0B1E38]/5 dark:bg-white/10 text-[#0B1E38] dark:text-blue-300 border border-[#0B1E38]/15 text-xs font-semibold">
                    <span>Gem Mine Tour Package</span>
                  </div>
                )}
              </div>

              {/* Group Pricing Tiers Breakdown */}
              {hasTiers && (
                <div className="pt-1 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300" />
                      Rates by Party Size
                    </span>
                    <span className="text-[11px] text-muted-foreground hidden sm:inline">
                      Discount applied automatically at checkout
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                    {pricingTiers.map((tier, idx) => {
                      const isLowest = lowestTierPrice !== null && tier.price === lowestTierPrice;
                      const label = tier.max_guests
                        ? `${tier.min_guests}–${tier.max_guests} Guests`
                        : `${tier.min_guests}+ Guests`;
                      const unit = tier.pricing_type === 'fixed_group' ? 'total / group' : '/ person';

                      return (
                        <div
                          key={idx}
                          className={`relative rounded-xl border p-2.5 sm:p-3 transition-all ${
                            isLowest
                              ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/30 shadow-xs ring-1 ring-emerald-500/20'
                              : 'border-border bg-background/80 hover:border-border/90'
                          }`}
                        >
                          {isLowest && (
                            <span className="absolute -top-2 right-2 text-[9px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.5 rounded-full shadow-2xs">
                              Best Value
                            </span>
                          )}
                          <div className="text-[11px] font-medium text-muted-foreground">
                            {label}
                          </div>
                          <div className="text-base sm:text-lg font-bold text-foreground font-sans mt-0.5">
                            ${tier.price}
                            <span className="text-[10px] sm:text-[11px] font-normal text-muted-foreground ml-1">
                              {unit}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-muted-foreground/80 leading-relaxed pt-0.5">
                    * Rates cover complete private chauffeured transport, licensed gemologist guide, gem pit descent, plantation lunch &amp; mineral panning.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Inclusions Highlights */}
            {(() => {
              const displayInclusions = inclusions && inclusions.length > 0
                ? inclusions.slice(0, 4).map(inc => inc.title)
                : [
                    'Private Chauffeured Transportation',
                    'Traditional 5-Course Plantation Lunch',
                    'Underground Pit Descent & Panning',
                    'Free Date Changes & Cancellation'
                  ];

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-1 text-xs text-muted-foreground">
                  {displayInclusions.map((title, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="truncate">{title}</span>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* CTA Buttons (Responsive full-width on mobile, auto on desktop) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              <Button
                asChild
                size="lg"
                className="bg-[#0B1E38] hover:bg-[#071527] text-white font-medium w-full sm:w-auto px-8 h-11 sm:h-12 text-xs sm:text-sm shadow-sm rounded-full justify-center border border-[#0B1E38] transition-all"
              >
                <Link href={bookingLink}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Book This Tour
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-background hover:bg-background-alt border-border hover:border-[#0B1E38]/40 text-foreground w-full sm:w-auto h-11 sm:h-12 text-xs sm:text-sm px-6 rounded-full justify-center transition-colors"
              >
                <a
                  href={getWhatsappUrl(content, `Hello Sapphire Trails, I would like to inquire about booking the "${title}".`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4 text-emerald-500" />
                  WhatsApp Concierge
                </a>
              </Button>
            </div>

          </div>

          {/* RIGHT 5 COLS: FRAMED PHOTO SHOWCASE (CRISP & PROPORTIONATE) */}
          <div className="lg:col-span-5 space-y-3">
            
            {/* Main Featured Photo Box */}
            <div className="relative w-full aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden border border-border/80 shadow-2xl bg-background-alt group">
              <Image
                src={selectedImage}
                alt={title}
                data-ai-hint={imageHint}
                fill
                priority
                className="object-cover object-center transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

              {/* Floating Starting Price Badge */}
              {(startingDisplayPrice || price) && (
                <div className="absolute bottom-3.5 left-3.5 sm:bottom-4 sm:left-4 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/20 px-3.5 py-2 shadow-xl">
                  <span className="text-[9px] sm:text-[10px] text-slate-300 uppercase tracking-widest block font-medium">
                    Starting from
                  </span>
                  <span className="text-base sm:text-lg font-bold text-white font-sans tracking-tight">
                    {startingDisplayPrice}{' '}
                    <span className="text-xs font-normal text-slate-300">
                      / {startingSuffix.replace(/^\/?(per\s*)?/i, '') || 'person'}
                    </span>
                  </span>
                </div>
              )}

              {/* View Full Gallery Link Button */}
              <a 
                href="#gallery"
                className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 px-3 py-1.5 text-[11px] sm:text-xs text-white hover:text-blue-200 transition-colors flex items-center gap-1.5 shadow-md"
              >
                <Maximize2 className="h-3 w-3" />
                <span>Photos ({allThumbnails.length > 1 ? allThumbnails.length : 'Gallery'})</span>
              </a>
            </div>

            {/* Interactive Thumbnail Strip - Full-Width Symmetrical Grid */}
            {allThumbnails.length > 1 && (
              <div 
                className="grid gap-2 sm:gap-2.5 pt-1"
                style={{ 
                  gridTemplateColumns: `repeat(${Math.min(allThumbnails.length, 4)}, minmax(0, 1fr))` 
                }}
              >
                {allThumbnails.slice(0, 4).map((thumb, idx) => {
                  const isSelected = selectedImage === thumb.src;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(thumb.src)}
                      className={`relative aspect-[4/3] w-full rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 group ${
                        isSelected
                          ? 'ring-2 ring-[#0B1E38] dark:ring-blue-400 border-2 border-transparent shadow-md scale-[1.02]'
                          : 'border border-border/80 opacity-75 hover:opacity-100 hover:border-[#0B1E38]/40'
                      }`}
                      aria-label={`View photo ${idx + 1}`}
                    >
                      <Image
                        src={thumb.src}
                        alt={thumb.alt}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#0B1E38]/10 dark:bg-blue-400/10 pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>

    </section>
  );
}
