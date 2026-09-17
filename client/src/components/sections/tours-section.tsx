"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import useEmblaCarousel from 'embla-carousel-react';
import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Clock, 
  Car, 
  ShieldCheck, 
  Gem, 
  CalendarCheck, 
  Sparkles, 
  Heart,
  CheckCircle2 
} from 'lucide-react';
import { mapServerPackageToClient, type TourPackage } from '@/lib/packages-data';
import { API_BASE_URL, cn } from '@/lib/utils';
import { useSiteContent, getWhatsappUrl } from '@/lib/site-content';


const TourCard = ({ tour }: { tour: TourPackage }) => {
  const tiers = tour.pricingTiers || [];
  const hasTiers = tiers.length > 0;
  const perPersonTiers = tiers.filter(t => t.pricing_type === 'per_person');
  const lowestTierPrice = perPersonTiers.length > 0 ? Math.min(...perPersonTiers.map(t => t.price)) : null;
  const displayPrice = hasTiers && lowestTierPrice !== null ? `From $${lowestTierPrice}` : tour.price;
  const displaySuffix = hasTiers && lowestTierPrice !== null ? '/ Person' : (tour.priceSuffix || '/ Person');

  return (
  <Card className="bg-card border border-border/80 flex flex-col w-full h-full transition-colors duration-300 hover:border-primary/40 rounded-2xl overflow-hidden group cursor-pointer shadow-sm">
    {/* Clickable Card Header & Image - Scaled down for mobile to maximize viewport efficiency */}
    <Link href={`/tours/${tour.slug}`} className="block relative h-44 sm:h-56 md:h-64 w-full overflow-hidden shrink-0">
      <Image
        src={tour.imageUrl}
        alt={tour.imageAlt || tour.homepageTitle}
        data-ai-hint={tour.imageHint}
        fill
        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 33vw"
        loading="lazy"
        className="object-cover transition-transform duration-500 md:group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      {/* Duration Badge */}
      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-black/80 border border-white/15 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-medium text-white flex items-center gap-1.5 z-10">
        <Clock className="h-3 w-3 text-white" />
        <span>{tour.duration || 'Full Day Expedition'}</span>
      </div>

      {/* Pricing Header */}
      <div className="absolute bottom-2.5 left-3 right-3 sm:bottom-3 sm:left-4 sm:right-4 flex items-end justify-between text-white z-10 font-sans">
        <div>
          <span className="text-xl sm:text-2xl md:text-3xl font-bold font-sans text-white">
            {displayPrice}
          </span>
          <span className="text-[11px] sm:text-xs text-white/80 ml-1 uppercase font-medium">
            {displaySuffix}
          </span>
        </div>
        {hasTiers ? (
          <Badge className="bg-emerald-700/90 text-white font-medium text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5 shadow-sm border border-white/20">
            Group Rates
          </Badge>
        ) : (
          <Badge className="bg-black/80 text-white/90 border border-white/20 font-medium text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5">
            VIP Inclusive
          </Badge>
        )}
      </div>
    </Link>

    {/* Content - Compact mobile padding & clean Poppins typography */}
    <CardContent className="p-4 sm:p-5 md:p-6 flex flex-col flex-grow justify-between space-y-3 sm:space-y-4">
      <Link href={`/tours/${tour.slug}`} className="block space-y-1.5 sm:space-y-2">
        <h3 className="text-base sm:text-lg md:text-xl font-sans font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-0 sm:min-h-[3rem] flex items-start leading-snug">
          {tour.homepageTitle}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 leading-relaxed min-h-0 sm:min-h-[3rem]">
          {tour.homepageDescription}
        </p>
      </Link>

      {/* Group Rates Chips */}
      {hasTiers && tour.pricingTiers && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {tour.pricingTiers.map((tier, tIdx) => (
            <span key={tIdx} className="inline-flex items-center text-[10px] bg-muted/60 dark:bg-muted/30 border border-border px-2 py-0.5 rounded-full font-medium text-foreground">
              {tier.min_guests}{tier.max_guests ? `–${tier.max_guests}` : '+'} pax: <strong className="ml-1 text-primary dark:text-blue-300">${tier.price}</strong>
              <span className="text-muted-foreground ml-0.5">{tier.pricing_type === 'fixed_group' ? 'grp' : '/p'}</span>
            </span>
          ))}
        </div>
      )}

      {/* Key Inclusions Badges in Navy accents */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 py-2.5 border-y border-border/60 text-[11px] text-muted-foreground font-sans">
        <div className="flex items-center gap-1.5">
          <Car className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300 flex-shrink-0" />
          <span className="truncate">Private AC Transport</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300 flex-shrink-0" />
          <span className="truncate">Licensed Gemologist</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Gem className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300 flex-shrink-0" />
          <span className="truncate">Active Pit Descent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300 flex-shrink-0" />
          <span className="truncate">All Entry Permits</span>
        </div>
      </div>

      {/* Dual CTA Buttons in Signature Navy */}
      <div className="flex items-center gap-2 sm:gap-3 pt-1">
        <Button asChild className="flex-1 bg-[#0B1E38] hover:bg-[#071527] text-white font-medium text-xs h-9 sm:h-10 rounded-full shadow-sm border border-[#0B1E38]">
          <Link href={`/tours/${tour.slug}/book`}>
            <CalendarCheck className="mr-1.5 h-3.5 w-3.5" />
            Book Now
          </Link>
        </Button>

        <Button asChild variant="outline" className="border border-[#0B1E38]/25 hover:border-[#0B1E38] text-[#0B1E38] hover:bg-[#0B1E38]/5 dark:border-white/20 dark:text-white text-xs h-9 sm:h-10 px-3.5 sm:px-5 rounded-full font-medium transition-colors">
          <Link href={`/tours/${tour.slug}`}>
            Details
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </CardContent>
  </Card>
  );
};


export function ToursSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false, 
    align: 'start',
    skipSnaps: true,
    dragFree: false,
    duration: 20,
    containScroll: 'trimSnaps',
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tours, setTours] = useState<TourPackage[]>([]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    async function fetchTours() {
      try {
        const response = await fetch(`${API_BASE_URL}/tours`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setTours(data.map(mapServerPackageToClient));
          }
        }
      } catch (e) {
        console.error("Failed to fetch tour packages.", e);
      }
    }
    fetchTours();
  }, []);

  const { content } = useSiteContent();
  const toursHeader = content.homepage.toursHeader;

  return (
    <section id="tours" className="w-full bg-background pt-12 md:pt-16 pb-16 md:pb-24 relative">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <ScrollAnimate className="text-center max-w-4xl lg:max-w-5xl mx-auto space-y-3 mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1E38]/5 dark:bg-white/5 border border-[#0B1E38]/15 dark:border-white/15 text-xs font-medium uppercase tracking-wider text-[#0B1E38] dark:text-blue-200 font-sans shadow-2xs">
            <Gem className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300" />
            {toursHeader.tagline || 'Curated Expeditions'}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-bold tracking-tight text-foreground">
            {toursHeader.heading || 'Exclusive Gem Mining Packages'}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 font-sans">
            {toursHeader.subtitle}
          </p>
        </ScrollAnimate>


        {/* Tour Cards Grid */}
        <ScrollAnimate>
          {/* Desktop View */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {tours.map((tour, index) => (
              <TourCard key={index} tour={tour} />
            ))}
          </div>

          {/* Mobile View Slider - High performance 60/120fps touch physics */}
          <div className="md:hidden relative">
            <div className="overflow-hidden -ml-4 touch-pan-y select-none" ref={emblaRef}>
              <div className="flex items-stretch transform-gpu">
                {tours.map((tour, index) => (
                  <div className="relative flex-[0_0_80%] sm:flex-[0_0_84%] min-w-0 pl-4 flex flex-col" key={index}>
                    <TourCard tour={tour} />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Carousel Indicator Dots */}
            {tours.length > 1 && (
              <div className="flex justify-center items-center gap-1.5 pt-4">
                {tours.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => emblaApi?.scrollTo(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      selectedIndex === i ? "w-6 bg-[#0B1E38] dark:bg-blue-300" : "w-1.5 bg-muted-foreground/30"
                    )}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollAnimate>

        {/* Spotlight Banner: Custom Proposal & Engagement Ring Tour */}
        <ScrollAnimate className="mt-12 md:mt-18">
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-border/80 dark:border-white/10 bg-[#0B1E38] text-white p-6 sm:p-8 md:p-12 shadow-xl">
            <div className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 opacity-25 lg:opacity-45">
              <Image
                src={content.tours.proposalCallout?.image || "https://content-provider.payshia.com/sapphire-trail/images/tour-7-optimized.webp"}
                alt="Custom Engagement Ring & Sapphire Craftsmanship"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#0B1E38] via-[#0B1E38]/90 to-transparent" />
            </div>

            <div className="relative z-10 max-w-2xl space-y-4 text-white font-sans">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-medium uppercase tracking-wider text-white">
                <Heart className="h-3 w-3 fill-white text-white" />
                {content.tours.proposalCallout?.badge || 'Once in a Lifetime'}
              </div>

              <h3 className="text-xl sm:text-3xl md:text-4xl font-sans font-bold leading-snug">
                {content.tours.proposalCallout?.title || 'Design Your Custom Engagement Ring in the Mines of Ceylon'}
              </h3>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                {content.tours.proposalCallout?.description || 'Find your own rough sapphire straight from the earth, watch our master lapidaries precision-cut your gem, and craft a bespoke engagement ring with our master jewelers.'}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Button asChild className="bg-white hover:bg-white/90 text-[#0B1E38] font-semibold text-xs rounded-full px-6 h-10 shadow-sm transition-all">
                  <Link href="/custom-proposal-package">
                    {content.tours.proposalCallout?.primaryButtonText || 'Explore Proposal Package'}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border border-white/30 bg-transparent hover:bg-white/10 text-white font-medium text-xs rounded-full px-5 h-10 transition-colors">
                  <a 
                    href={getWhatsappUrl(content, 'Hello Sapphire Trails, I am interested in the Custom Proposal Package & Bespoke Ring Crafting.')} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {content.tours.proposalCallout?.secondaryButtonText || 'WhatsApp Concierge'}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </ScrollAnimate>

      </div>
    </section>
  );
}
