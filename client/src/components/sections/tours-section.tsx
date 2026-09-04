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
import { API_BASE_URL } from '@/lib/utils';
import { useSiteContent } from '@/lib/site-content';


const TourCard = ({ tour }: { tour: TourPackage }) => (
  <Card className="bg-card border border-border/70 flex flex-col w-full transform transition-all duration-300 hover:scale-[1.01] hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 rounded-2xl overflow-hidden group cursor-pointer">
    {/* Clickable Card Header & Image */}
    <Link href={`/tours/${tour.slug}`} className="block relative h-64 sm:h-72 w-full overflow-hidden">
      <Image
        src={tour.imageUrl}
        alt={tour.imageAlt || tour.homepageTitle}
        data-ai-hint={tour.imageHint}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      {/* Duration Badge */}
      <div className="absolute top-3 left-3 bg-black/60 border border-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 z-10">
        <Clock className="h-3 w-3 text-primary" />
        <span>{tour.duration || 'Full Day Expedition'}</span>
      </div>

      {/* Pricing Header */}
      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white z-10">
        <div>
          <span className="text-2xl sm:text-3xl font-bold font-serif text-primary drop-shadow">
            {tour.price}
          </span>
          <span className="text-xs text-white/80 ml-1.5 uppercase font-medium">
            {tour.priceSuffix || '/ Person'}
          </span>
        </div>
        <Badge className="bg-primary/90 text-black font-semibold text-[10px] uppercase tracking-widest">
          VIP Inclusive
        </Badge>
      </div>
    </Link>

    {/* Content */}
    <CardContent className="p-6 sm:p-7 flex flex-col flex-grow justify-between space-y-5">
      <Link href={`/tours/${tour.slug}`} className="block space-y-3">
        <h3 className="text-xl sm:text-2xl font-headline font-bold text-foreground group-hover:text-primary transition-colors">
          {tour.homepageTitle}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {tour.homepageDescription}
        </p>
      </Link>

      {/* Key Inclusions Badges */}
      <div className="grid grid-cols-2 gap-2 py-3 border-y border-border/60 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Car className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span className="truncate">Private AC Transport</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span className="truncate">Licensed Gemologist</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Gem className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span className="truncate">Active Pit Descent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span className="truncate">All Entry Permits</span>
        </div>
      </div>

      {/* Dual CTA Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <Button asChild className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-10 rounded-full shadow-md">
          <Link href={`/tours/${tour.slug}/book`}>
            <CalendarCheck className="mr-1.5 h-3.5 w-3.5" />
            Book Now
          </Link>
        </Button>

        <Button asChild variant="outline" className="border-border text-foreground hover:bg-primary/10 hover:text-primary text-xs h-10 px-5 rounded-full">
          <Link href={`/tours/${tour.slug}`}>
            Details
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </CardContent>
  </Card>
);


export function ToursSection() {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' });
  const [tours, setTours] = useState<TourPackage[]>([]);

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
    <section id="tours" className="w-full bg-background py-16 md:py-28 relative">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <ScrollAnimate className="text-center max-w-3xl mx-auto space-y-3 mb-14 md:mb-18">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold uppercase tracking-wider text-primary">
            <Gem className="h-3.5 w-3.5" />
            {toursHeader.tagline || 'Curated Expeditions'}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary">
            {toursHeader.heading || 'Exclusive Gem Mining Packages'}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {toursHeader.subtitle}
          </p>
        </ScrollAnimate>


        {/* Tour Cards Grid */}
        <ScrollAnimate>
          {/* Desktop View */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {tours.map((tour, index) => (
              <TourCard key={index} tour={tour} />
            ))}
          </div>

          {/* Mobile View Slider */}
          <div className="md:hidden relative">
            <div className="overflow-hidden -ml-4" ref={emblaRef}>
              <div className="flex">
                {tours.map((tour, index) => (
                  <div className="relative flex-[0_0_88%] min-w-0 pl-4" key={index}>
                    <TourCard tour={tour} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollAnimate>

        {/* Spotlight Banner: Custom Proposal & Engagement Ring Tour */}
        <ScrollAnimate className="mt-14 md:mt-20">
          <div className="relative rounded-3xl overflow-hidden border border-primary/40 bg-gradient-to-r from-black via-zinc-950 to-neutral-900 p-8 sm:p-12 shadow-2xl">
            <div className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 opacity-25 lg:opacity-50">
              <Image
                src="https://content-provider.payshia.com/sapphire-trail/images/img4.webp"
                alt="Couple inspecting a glowing sapphire"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            </div>

            <div className="relative z-10 max-w-2xl space-y-5 text-white">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/50 text-xs font-semibold uppercase tracking-wider text-primary">
                <Heart className="h-3.5 w-3.5 fill-primary text-primary" />
                {content.tours.proposalCallout?.badge || 'Once in a Lifetime'}
              </div>

              <h3 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold leading-tight">
                {content.tours.proposalCallout?.title || 'Design Your Custom Engagement Ring in the Mines of Ceylon'}
              </h3>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-light">
                {content.tours.proposalCallout?.description || 'Find your own rough sapphire straight from the earth, watch our master lapidaries precision-cut your gem, and craft a bespoke engagement ring with our master jewelers.'}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-full px-7 h-11">
                  <Link href="/custom-proposal-package">
                    <Sparkles className="mr-1.5 h-4 w-4" />
                    {content.tours.proposalCallout?.primaryButtonText || 'Explore Proposal Package'}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 text-xs rounded-full px-6 h-11">
                  <Link href="/contact">
                    {content.tours.proposalCallout?.secondaryButtonText || 'Inquire with Concierge'}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </ScrollAnimate>


      </div>
    </section>
  );
}
