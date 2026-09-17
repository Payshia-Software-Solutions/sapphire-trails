
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarCheck, Clock, DollarSign, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PricingTier } from '@/lib/packages-data';

interface TourFloatingBarProps {
  price: string;
  priceSuffix: string;
  duration: string;
  bookingLink: string;
  pricingTiers?: PricingTier[];
}

export function TourFloatingBar({ price, priceSuffix, duration, bookingLink, pricingTiers = [] }: TourFloatingBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  const hasTiers = Array.isArray(pricingTiers) && pricingTiers.length > 0;
  const perPersonTiers = hasTiers ? pricingTiers.filter(t => t.pricing_type === 'per_person') : [];
  const lowestTierPrice = perPersonTiers.length > 0 ? Math.min(...perPersonTiers.map(t => t.price)) : null;
  const displayPrice = hasTiers && lowestTierPrice !== null ? `$${lowestTierPrice}` : price;
  const displaySuffix = hasTiers && lowestTierPrice !== null ? 'per person' : priceSuffix;

  useEffect(() => {
    const heroElement = document.querySelector('section');
    if (!heroElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
      },
      { threshold: 0 }
    );

    observer.observe(heroElement);
    return () => { if (heroElement) observer.unobserve(heroElement); };
  }, []);

  return (
    <div
      className={`hidden md:block fixed top-24 right-4 md:right-8 z-40 transition-all duration-300 ease-in-out w-64
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16 pointer-events-none'}
      `}
    >
      <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden">
        {/* Colored top strip */}
        <div className="h-1 bg-[#0B1E38] w-full" />

        <div className="p-5 font-sans">
          {/* Price */}
          <p className="text-[11px] text-muted-foreground uppercase tracking-[0.18em] font-sans font-medium mb-1">
            {hasTiers ? 'Starting from' : 'Price'}
          </p>
          <div className="flex items-end gap-1 mb-2">
            <span className="text-3xl font-bold text-foreground font-sans tracking-tight">{displayPrice}</span>
            <span className="text-sm text-muted-foreground mb-1 font-sans">{displaySuffix}</span>
          </div>

          {hasTiers && (
            <div className="mb-3">
              <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                ✓ Group Rates Available
              </span>
            </div>
          )}

          {/* Duration */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5 pb-5 border-b border-border">
            <Clock className="h-4 w-4 text-[#0B1E38] dark:text-blue-300 shrink-0" />
            <span>{duration}</span>
          </div>

          {/* Book Now CTA */}
          <Button asChild size="default" className="w-full rounded-full font-sans font-medium uppercase tracking-wider text-xs bg-[#0B1E38] hover:bg-[#071527] text-white border border-[#0B1E38] shadow-sm transition-all">
            <Link href={bookingLink} className="flex items-center justify-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              <span>Book Tour</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
