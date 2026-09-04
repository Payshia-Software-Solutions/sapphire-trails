'use client';

import { useState } from 'react';
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
  Sparkles, 
  Gem, 
  Compass,
  CheckCircle2,
  Maximize2,
  ChevronRight
} from 'lucide-react';

import { getFullImageUrl } from '@/lib/utils';
import type { GalleryImage } from '@/lib/packages-data';

interface TourDetailHeroProps {
  title: string;
  duration: string;
  price: string;
  priceSuffix: string;
  imageUrl: string;
  imageHint: string;
  bookingLink: string;
  galleryImages?: GalleryImage[];
}

const FALLBACK_HERO_IMAGE = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop&q=80';

export function TourDetailHero({
  title,
  duration,
  price,
  priceSuffix,
  imageUrl,
  imageHint,
  bookingLink,
  galleryImages = []
}: TourDetailHeroProps) {
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

  return (
    <section id="overview" className="relative w-full py-8 sm:py-12 lg:py-20 bg-background border-b border-border/80 overflow-hidden">
      
      {/* Subtle Background Ambience */}
      <div className="absolute top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="container relative z-10 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation - Unified site-wide */}
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          <Link href="/tours" className="hover:text-primary transition-colors">Tours</Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          <span className="text-primary font-medium truncate max-w-[200px] sm:max-w-md">{title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">

          
          {/* LEFT 7 COLS: TEXT CONTENT & ACTIONS */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs uppercase tracking-widest font-semibold gap-1.5 shadow-sm">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                <span>Exclusive Private Excursion</span>
              </Badge>

              <div className="flex items-center gap-1 bg-background-alt border border-border px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs text-foreground">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1 text-[10px] sm:text-[11px] font-semibold text-muted-foreground">5.0 Star</span>
              </div>
            </div>

            {/* Tour Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground leading-[1.2] sm:leading-[1.15] tracking-tight">
              {title}
            </h1>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
              <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-border bg-background-alt px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-foreground shadow-sm">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>{duration || 'Full Day'}</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-border bg-background-alt px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-foreground shadow-sm">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span>Safety Certified</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-border bg-background-alt px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-foreground shadow-sm">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span>Master Gemologist Guided</span>
              </div>

              {price && (
                <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold text-primary shadow-sm">
                  <span>{price}</span>
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground font-normal">{priceSuffix || 'per person'}</span>
                </div>
              )}
            </div>

            {/* Quick Inclusions Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>100% Private Chauffeured Tour</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Authentic 5-Course Plantation Lunch</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Underground Pit Descent &amp; Panning</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Free Date Changes &amp; Cancellation</span>
              </div>
            </div>

            {/* CTA Buttons (Responsive full-width on mobile, auto on desktop) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold w-full sm:w-auto px-8 h-11 sm:h-12 text-xs sm:text-sm shadow-xl shadow-primary/20 rounded-full justify-center"
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
                className="bg-background hover:bg-background-alt border-border text-foreground hover:text-primary w-full sm:w-auto h-11 sm:h-12 text-xs sm:text-sm px-6 rounded-full justify-center"
              >
                <a
                  href={`https://wa.me/94712357700?text=${encodeURIComponent(`Hello Sapphire Trails, I would like to inquire about booking the "${title}".`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4 text-emerald-400" />
                  WhatsApp Concierge
                </a>
              </Button>
            </div>

          </div>

          {/* RIGHT 5 COLS: FRAMED PHOTO SHOWCASE (CRISP & PROPORTIONATE) */}
          <div className="lg:col-span-5 space-y-3">
            
            {/* Main Featured Photo Box */}
            <div className="relative w-full aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden border border-border shadow-2xl bg-background-alt group">
              <Image
                src={selectedImage}
                alt={title}
                data-ai-hint={imageHint}
                fill
                priority
                className="object-cover object-center transition-all duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Floating Price Pill */}
              {price && (
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 rounded-xl bg-black/85 backdrop-blur-md border border-primary/30 px-3 sm:px-3.5 py-1.5 sm:py-2 shadow-lg">
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest block font-medium">Starting from</span>
                  <span className="text-base sm:text-lg font-bold text-primary font-serif">{price} <span className="text-xs font-normal text-muted-foreground">{priceSuffix || 'per person'}</span></span>
                </div>
              )}

              {/* View Gallery Action */}
              <a 
                href="#gallery"
                className="absolute top-3 sm:top-4 right-3 sm:right-4 rounded-full bg-black/75 backdrop-blur-md border border-white/20 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs text-white hover:text-primary transition-colors flex items-center gap-1.5 shadow"
              >
                <Maximize2 className="h-3 w-3" />
                <span>Photos ({allThumbnails.length > 1 ? allThumbnails.length : 'Gallery'})</span>
              </a>
            </div>

            {/* Interactive Thumbnail Strip */}
            {allThumbnails.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                {allThumbnails.map((thumb, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(thumb.src)}
                    className={`relative h-12 sm:h-14 w-16 sm:w-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === thumb.src
                        ? 'border-primary ring-2 ring-primary/40 shadow-md scale-102'
                        : 'border-border/80 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={thumb.src}
                      alt={thumb.alt}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

    </section>
  );
}
