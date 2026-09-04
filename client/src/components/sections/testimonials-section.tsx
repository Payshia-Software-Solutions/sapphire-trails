"use client";

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import useEmblaCarousel from 'embla-carousel-react';
import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Quote, 
  ArrowLeft, 
  ArrowRight,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type ReviewItem, getStoredReviews } from '@/lib/reviews-data';
import { useSiteContent } from '@/lib/site-content';

export function TestimonialsSection() {
  const { content } = useSiteContent();
  const reviewsHeader = content.homepage.reviewsHeader;
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });

  useEffect(() => {
    const loaded = getStoredReviews();
    setReviews(loaded.filter(r => r.status === 'published'));
  }, []);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const displayReviews = reviews.length > 0 ? reviews : getStoredReviews();

  return (
    <section className="w-full bg-background-alt py-16 md:py-28 relative overflow-hidden">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollAnimate className="max-w-3xl mx-auto text-center space-y-3 mb-14 md:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider text-amber-500">
            <Award className="h-3.5 w-3.5" />
            {reviewsHeader.tagline || 'Verified Traveler Experiences'}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary">
            {reviewsHeader.heading || 'Loved by Travelers Worldwide'}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {reviewsHeader.subtitle}
          </p>

          
          {/* Rating Summary Strip */}
          <div className="flex items-center justify-center gap-2 pt-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <strong className="text-foreground">5.0 / 5.0 Rating</strong>
            <span>&bull;</span>
            <span>Over 500+ Verified 5-Star Reviews on TripAdvisor &amp; Google</span>
          </div>
        </ScrollAnimate>

        {/* Testimonials Carousel */}
        <ScrollAnimate className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4 sm:-ml-6">
              {displayReviews.map((item) => (
                <div key={item.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4 sm:pl-6">
                  <Card className="bg-card border border-border/70 rounded-2xl h-full flex flex-col justify-between p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
                    <CardContent className="p-0 flex flex-col justify-between h-full space-y-5">
                      
                      {/* Top Row: Stars + Source Badge + Quote */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center text-amber-400">
                              {[...Array(item.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            
                            {/* Source Badge */}
                            {item.source === 'tripadvisor' && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                TripAdvisor
                              </span>
                            )}
                            {item.source === 'google' && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                Google
                              </span>
                            )}
                          </div>
                          
                          <Quote className="h-6 w-6 text-primary/25 flex-shrink-0" />
                        </div>

                        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
                          &ldquo;{item.review}&rdquo;
                        </p>
                      </div>

                      {/* Author Info */}
                      <div className="pt-4 border-t border-border/60 flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-primary/40 bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {item.avatar && item.avatar.startsWith('http') ? (
                            <Image
                              src={item.avatar}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="font-bold text-xs text-primary">
                              {item.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{item.location}</p>
                          <p className="text-[10px] text-primary/90 font-medium font-serif mt-0.5 truncate">{item.tour}</p>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              className="h-9 w-9 rounded-full border-border hover:bg-primary/10 hover:text-primary"
              aria-label="Previous review"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="h-9 w-9 rounded-full border-border hover:bg-primary/10 hover:text-primary"
              aria-label="Next review"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </ScrollAnimate>

      </div>
    </section>
  );
}
