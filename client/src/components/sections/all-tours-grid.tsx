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
  MessageSquare,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { API_BASE_URL, cn } from '@/lib/utils';

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
    <section className="w-full py-12 md:py-20 bg-background relative font-sans">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        
        {/* Filter Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 mb-4 border-b border-border/80">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1E38]/5 dark:bg-white/5 border border-[#0B1E38]/15 dark:border-white/15 text-xs font-medium uppercase tracking-[0.18em] text-[#0B1E38] dark:text-blue-200 shadow-2xs">
              <span>Available Itineraries</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold tracking-tight text-foreground leading-tight pt-1">
              Select Your Gemological Journey
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center bg-card p-1 rounded-full border border-border/80 gap-1 shadow-xs">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory('all')}
              className={cn(
                "rounded-full text-xs h-8 px-4 font-medium transition-all",
                activeCategory === 'all' ? "bg-[#0B1E38] hover:bg-[#071527] text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              All Packages ({allTours.length})
            </Button>
            <Button
              variant={activeCategory === 'single-day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory('single-day')}
              className={cn(
                "rounded-full text-xs h-8 px-4 font-medium transition-all",
                activeCategory === 'single-day' ? "bg-[#0B1E38] hover:bg-[#071527] text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Single-Day Tours
            </Button>
            <Button
              variant={activeCategory === 'multi-day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory('multi-day')}
              className={cn(
                "rounded-full text-xs h-8 px-4 font-medium transition-all",
                activeCategory === 'multi-day' ? "bg-[#0B1E38] hover:bg-[#071527] text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Multi-Day Expeditions
            </Button>
          </div>
        </div>

        {/* Content Loading & Grid */}
        {isLoading ? (
          <div className="text-center text-muted-foreground py-20 flex flex-col items-center gap-4 animate-pulse font-sans">
            <LoaderCircle className="h-10 w-10 text-[#0B1E38] dark:text-blue-300 animate-spin" />
            <p className="text-sm font-medium">Loading luxury tour packages...</p>
          </div>
        ) : filteredTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch font-sans">
            {filteredTours.map((tour) => {
              const highlights = Array.isArray(tour.tourHighlights) ? tour.tourHighlights.slice(0, 3) : [];
              const duration = tour.duration || 'Full Day Expedition';
              const price = tour.price || 'Custom Quote';

              return (
                <Card
                  key={tour.id}
                  className="bg-card border border-border/80 flex flex-col w-full rounded-2xl overflow-hidden hover:border-[#0B1E38]/40 transition-colors group cursor-pointer shadow-xs"
                >
                  {/* Tour Image with Badges - Clickable Link */}
                  <Link href={`/tours/${tour.slug}`} className="block relative aspect-[16/10] w-full overflow-hidden bg-muted/20">
                    <Image
                      src={tour.imageUrl}
                      alt={tour.imageAlt || tour.homepageTitle}
                      data-ai-hint={tour.imageHint}
                      fill
                      className="object-cover transition-transform duration-500 ease-out md:group-hover:scale-105"
                    />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
                      <Badge className="bg-black/75 text-white font-medium text-[11px] border border-white/20 px-2.5 py-0.5 rounded-full shadow-sm">
                        <Clock className="h-3 w-3 mr-1" />
                        {duration}
                      </Badge>
                    </div>

                    <div className="absolute top-3 right-3 z-10">
                      <Badge variant="outline" className="bg-black/75 text-white border-white/20 text-[10px] uppercase font-medium tracking-wider rounded-full shadow-sm">
                        100% Private
                      </Badge>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 md:group-hover:opacity-40 transition-opacity" />
                  </Link>

                  {/* Card Content */}
                  <CardContent className="p-6 flex flex-col flex-grow justify-between space-y-4 font-sans">
                    <div className="space-y-3">
                      {/* Price Header */}
                      <div className="flex items-baseline justify-between border-b border-border/70 pb-3">
                        <span className="text-xl font-sans font-bold text-foreground tracking-tight">
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
                        <h3 className="text-base sm:text-lg font-sans font-semibold text-foreground group-hover:text-[#0B1E38] dark:group-hover:text-blue-200 transition-colors leading-snug">
                          {tour.homepageTitle}
                        </h3>
                      </Link>

                      {/* Description - Clickable Link */}
                      <Link href={`/tours/${tour.slug}`} className="block">
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed font-normal hover:text-foreground transition-colors">
                          {tour.homepageDescription}
                        </p>
                      </Link>

                      {/* Key Highlights / Inclusions */}
                      {highlights.length > 0 && (
                        <div className="pt-2 space-y-1.5 border-t border-border/60">
                          {highlights.map((h, hIdx) => (
                            <div key={hIdx} className="flex items-center gap-2 text-xs text-foreground font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300 shrink-0" />
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
                        className="flex-1 bg-[#0B1E38] hover:bg-[#071527] text-white font-medium rounded-full text-xs h-10 shadow-sm border border-[#0B1E38] transition-all"
                      >
                        <Link href={`/tours/${tour.slug}/book`}>
                          <CalendarCheck className="mr-1.5 h-4 w-4" />
                          Book Tour
                        </Link>
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        className="flex-1 rounded-full text-xs h-10 border-border hover:border-[#0B1E38]/40 text-foreground font-medium transition-colors"
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
