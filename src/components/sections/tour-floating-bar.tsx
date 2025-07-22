
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarCheck, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    const heroElement = document.querySelector('section'); // The first section is assumed to be the hero
    if (!heroElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the hero is NOT intersecting (i.e., scrolled past), show the bar.
        // The second condition ensures it doesn't show when scrolling back up past the hero.
        setIsVisible(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
      },
      { threshold: 0 }
    );

    observer.observe(heroElement);

    return () => {
      if (heroElement) {
        observer.unobserve(heroElement);
      }
    };
  }, []);

  return (
    <div className={`fixed top-28 right-4 md:right-8 z-40 transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12 pointer-events-none'}`}>
      <Card className="w-full max-w-xs shadow-xl bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg text-primary">Quick Book</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-4 pt-2">
            <div className="text-left">
                <span className="text-3xl font-bold text-foreground">{price}</span>
                <span className="text-sm text-muted-foreground ml-1">{priceSuffix}</span>
            </div>
             <div className="flex items-center gap-2 text-base text-muted-foreground">
                <Clock className="h-5 w-5 text-primary" />
                <span>{duration}</span>
            </div>
            <Button asChild size="lg" className="w-full mt-2">
                <Link href={bookingLink}>
                    <CalendarCheck className="mr-2 h-5 w-5" />
                    Book Now
                </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
