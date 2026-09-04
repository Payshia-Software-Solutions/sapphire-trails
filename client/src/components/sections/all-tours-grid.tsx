'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mapServerPackageToClient, type TourPackage } from '@/lib/packages-data';
import { 
  CalendarCheck, 
  ArrowRight, 
  LoaderCircle, 
  PackageSearch, 
  Clock, 
  Users, 
  ShieldCheck, 
  Gem, 
  Sparkles, 
  MessageSquare,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';

export function AllToursGrid() {
  const [allTours, setAllTours] = useState<TourPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'single-day' | 'multi-day'>('all');

  useEffect(() => {
    async function fetchTours() {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/tours`);
        if (!response.ok) {
          console.error('Failed to fetch from server.');
          setAllTours([]);
          return;
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setAllTours(data.map(mapServerPackageToClient));
        } else {
          setAllTours([]);
        }
      } catch (e) {
        console.error('Failed to fetch packages', e);
        setAllTours([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTours();
  }, []);

  const filteredTours = useMemo(() => {
    if (activeCategory === 'all') return allTours;
    if (activeCategory === 'single-day') {
      return allTours.filter((t) => {
        const d = (t.duration || '').toLowerCase();
        const title = (t.homepageTitle || '').toLowerCase();
        return d.includes('day') && !d.includes('night') && !d.includes('2 day') && !d.includes('3 day') && !title.includes('2-day') && !title.includes('3-day');
      });
    }
    if (activeCategory === 'multi-day') {
      return allTours.filter((t) => {
        const d = (t.duration || '').toLowerCase();
        const title = (t.homepageTitle || '').toLowerCase();
        return d.includes('night') || d.includes('2 day') || d.includes('3 day') || title.includes('2-day') || title.includes('3-day') || title.includes('multi');
      });
    }
    return allTours;
  }, [allTours, activeCategory]);

  return (
    <section className="w-full py-12 md:py-20 bg-background relative">
      <div className="container mx-auto px-4 md:px-6 max-w-screen-2xl">
        
        {/* Filter Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 mb-4 border-b border-border/80">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary font-serif">
              Available Itineraries
            </span>
            <h2 className="text-2xl sm:text-3xl font-headline font-bold text-foreground">
              Select Your Gemological Journey
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center bg-card p-1 rounded-full border shadow-xs gap-1">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory('all')}
              className="rounded-full text-xs h-8 px-4 font-semibold"
            >
              All Packages ({allTours.length})
            </Button>
            <Button
              variant={activeCategory === 'single-day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory('single-day')}
              className="rounded-full text-xs h-8 px-4 font-semibold"
            >
              Single-Day Tours
            </Button>
            <Button
              variant={activeCategory === 'multi-day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory('multi-day')}
              className="rounded-full text-xs h-8 px-4 font-semibold"
            >
              Multi-Day Expeditions
            </Button>
          </div>
        </div>

        {/* Content Loading & Grid */}
        {isLoading ? (
          <div className="text-center text-muted-foreground py-20 flex flex-col items-center gap-4 animate-pulse">
            <LoaderCircle className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm font-medium">Loading luxury tour packages...</p>
          </div>
        ) : filteredTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {filteredTours.map((tour) => {
              const highlights = Array.isArray(tour.tourHighlights) ? tour.tourHighlights.slice(0, 3) : [];
              const duration = tour.duration || 'Full Day Expedition';
              const price = tour.price || 'Custom Quote';

              return (
                <Card
                  key={tour.id}
                  className="bg-card border border-border/80 flex flex-col w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/50 transition-all duration-300 group cursor-pointer"
                >
                  {/* Tour Image with Badges - Clickable Link */}
                  <Link href={`/tours/${tour.slug}`} className="block relative aspect-[16/10] w-full overflow-hidden">
                    <Image
                      src={tour.imageUrl}
                      alt={tour.imageAlt || tour.homepageTitle}
                      data-ai-hint={tour.imageHint}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
                      <Badge className="bg-slate-950/80 backdrop-blur-md text-primary font-semibold text-[11px] border border-primary/30 px-2.5 py-0.5">
                        <Clock className="h-3 w-3 mr-1" />
                        {duration}
                      </Badge>
                    </div>

                    <div className="absolute top-3 right-3 z-10">
                      <Badge variant="outline" className="bg-slate-950/80 backdrop-blur-md text-white border-white/20 text-[10px] uppercase font-bold tracking-wider">
                        100% Private
                      </Badge>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  </Link>

                  {/* Card Content */}
                  <CardContent className="p-6 flex flex-col flex-grow justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Price Header */}
                      <div className="flex items-baseline justify-between border-b pb-3">
                        <span className="text-xl font-bold font-headline text-primary">
                          {price}{' '}
                          <span className="text-xs font-normal text-muted-foreground">
                            {tour.priceSuffix || '/ person'}
                          </span>
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          Certified Safe
                        </span>
                      </div>

                      {/* Title - Clickable Link */}
                      <Link href={`/tours/${tour.slug}`} className="block">
                        <h3 className="text-xl font-bold font-headline text-foreground group-hover:text-primary transition-colors leading-snug">
                          {tour.homepageTitle}
                        </h3>
                      </Link>

                      {/* Description - Clickable Link */}
                      <Link href={`/tours/${tour.slug}`} className="block">
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed font-light hover:text-foreground transition-colors">
                          {tour.homepageDescription}
                        </p>
                      </Link>

                      {/* Key Highlights / Inclusions */}
                      {highlights.length > 0 && (
                        <div className="pt-2 space-y-1.5 border-t border-border/60">
                          {highlights.map((h, hIdx) => (
                            <div key={hIdx} className="flex items-center gap-2 text-xs text-foreground font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="truncate">{h.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>


                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-border/80 flex items-center gap-2.5">
                      <Button
                        asChild
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-xs h-10 shadow-sm"
                      >
                        <Link href={`/tours/${tour.slug}/book`}>
                          <CalendarCheck className="mr-1.5 h-4 w-4" />
                          Book Tour
                        </Link>
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        className="flex-1 rounded-xl text-xs h-10 border-primary/40 text-primary hover:bg-primary/10"
                      >
                        <Link href={`/tours/${tour.slug}`}>
                          View Details
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-20 flex flex-col items-center gap-4">
            <PackageSearch className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-base font-semibold text-foreground">No tour packages found in this category.</p>
            <Button variant="outline" size="sm" onClick={() => setActiveCategory('all')}>
              Show All Tours
            </Button>
          </div>
        )}

      </div>
    </section>
  );
}
