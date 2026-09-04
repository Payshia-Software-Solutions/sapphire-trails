
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarCheck, Clock, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TourFloatingBarProps {
  price: string;
  priceSuffix: string;
  duration: string;
  bookingLink: string;
}

export function TourFloatingBar({ price, priceSuffix, duration, bookingLink }: TourFloatingBarProps) {
  const [isVisible, setIsVisible] = useState(false);

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
        <div className="h-1 bg-primary w-full" />

        <div className="p-5">
          {/* Price */}
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-serif mb-1">Starting from</p>
          <div className="flex items-end gap-1 mb-4">
            <span className="text-3xl font-bold text-foreground font-headline">{price}</span>
            <span className="text-sm text-muted-foreground mb-1">{priceSuffix}</span>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5 pb-5 border-b border-border">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            <span>{duration}</span>
          </div>

          {/* Book Now CTA */}
          <Button asChild size="default" className="w-full rounded-full font-serif uppercase tracking-widest text-xs">
            <Link href={bookingLink} className="flex items-center justify-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              Book Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
