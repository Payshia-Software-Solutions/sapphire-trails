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

interface AllToursGridProps {
  initialTours?: TourPackage[];
}

export function AllToursGrid({ initialTours = [] }: AllToursGridProps) {
  const [allTours, setAllTours] = useState<TourPackage[]>(initialTours);
  const [isLoading, setIsLoading] = useState(initialTours.length === 0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'single-day' | 'multi-day'>('all');

  useEffect(() => {
    // If we already have initial server-rendered tours, do not block UI with a loading state
    async function fetchTours() {
      if (allTours.length === 0) {
        setIsLoading(true);
      }
      try {
        const response = await fetch(`${API_BASE_URL}/tours`);
        if (!response.ok) {
          console.error('Failed to fetch from server.');
          return;
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setAllTours(data.map(mapServerPackageToClient));
        }
      } catch (e) {
        console.error('Failed to fetch packages', e);
      } finally {
        setIsLoading(false);
      }
    }

    // If no initial tours were provided, fetch immediately
    if (initialTours.length === 0) {
      fetchTours();
    }
  }, [initialTours]);

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

          {/* Category Filter Pills (Responsive for Mobile & Desktop) */}
          <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="inline-flex items-center bg-card p-1 rounded-full border border-border/80 gap-1 shadow-xs whitespace-nowrap min-w-max">
              <Button
                variant={activeCategory === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveCategory('all')}
                className={cn(
                  "rounded-full text-xs h-8 px-3.5 sm:px-4 font-medium transition-all shrink-0 whitespace-nowrap",
                  activeCategory === 'all' ? "bg-[#0B1E38] hover:bg-[#071527] text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="sm:hidden">All ({allTours.length})</span>
                <span className="hidden sm:inline">All Packages ({allTours.length})</span>
              </Button>
              <Button
                variant={activeCategory === 'single-day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveCategory('single-day')}
                className={cn(
                  "rounded-full text-xs h-8 px-3.5 sm:px-4 font-medium transition-all shrink-0 whitespace-nowrap",
                  activeCategory === 'single-day' ? "bg-[#0B1E38] hover:bg-[#071527] text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="sm:hidden">Single-Day</span>
                <span className="hidden sm:inline">Single-Day Tours</span>
              </Button>
              <Button
                variant={activeCategory === 'multi-day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveCategory('multi-day')}
                className={cn(
                  "rounded-full text-xs h-8 px-3.5 sm:px-4 font-medium transition-all shrink-0 whitespace-nowrap",
                  activeCategory === 'multi-day' ? "bg-[#0B1E38] hover:bg-[#071527] text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="sm:hidden">Multi-Day</span>
                <span className="hidden sm:inline">Multi-Day Expeditions</span>
              </Button>
            </div>
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

              const tiers = tour.pricingTiers || [];
              const hasTiers = tiers.length > 0;
              const perPersonTiers = tiers.filter(t => t.pricing_type === 'per_person');
              const lowestTierPrice = perPersonTiers.length > 0 ? Math.min(...perPersonTiers.map(t => t.price)) : null;
              const displayPrice = hasTiers && lowestTierPrice !== null ? `From $${lowestTierPrice}` : price;
              const displaySuffix = hasTiers && lowestTierPrice !== null ? '/ person' : (tour.priceSuffix || '/ person');

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
                      {hasTiers && (
                        <Badge className="bg-emerald-700/90 text-white font-medium text-[10px] border border-white/20 px-2 py-0.5 rounded-full shadow-sm">
                          Group Rates
                        </Badge>
                      )}
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
                          {displayPrice}{' '}
                          <span className="text-xs font-normal text-muted-foreground">
                            {displaySuffix}
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

                      {/* Group Rates Preview Strip */}
                      {hasTiers && tour.pricingTiers && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Group Rates:</span>
                          {tour.pricingTiers.map((tier, tIdx) => (
                            <span key={tIdx} className="inline-flex items-center text-[10px] bg-muted/60 dark:bg-muted/30 border border-border px-2 py-0.5 rounded-full font-medium text-foreground">
                              {tier.min_guests}{tier.max_guests ? `–${tier.max_guests}` : '+'} pax: <strong className="ml-1 text-[#0B1E38] dark:text-blue-300">${tier.price}</strong>
                              <span className="text-muted-foreground ml-0.5">{tier.pricing_type === 'fixed_group' ? 'grp' : '/p'}</span>
                            </span>
                          ))}
                        </div>
                      )}

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
          <div className="text-center text-muted-foreground py-16 sm:py-20 flex flex-col items-center gap-3 sm:gap-4 bg-card/50 dark:bg-card/30 border border-dashed border-border/80 rounded-3xl p-6 sm:p-10 my-4 shadow-2xs">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-primary/5 dark:bg-blue-950/40 flex items-center justify-center border border-primary/10 dark:border-blue-800/30 text-[#0B1E38] dark:text-blue-300">
              <PackageSearch className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <div className="space-y-1 max-w-md">
              <p className="text-base sm:text-lg font-semibold text-foreground">
                No tour packages found
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                There are currently no packages listed under &ldquo;
                {activeCategory === 'single-day' ? 'Single-Day Tours' : 'Multi-Day Expeditions'}
                &rdquo;.
              </p>
            </div>
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => setActiveCategory('all')}
              className="mt-2 bg-[#0B1E38] hover:bg-[#071527] text-white rounded-full text-xs h-9 px-5 shadow-xs font-medium"
            >
              Show All Packages ({allTours.length})
            </Button>
          </div>
        )}

      </div>
    </section>
  );
}
