'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight, Compass } from "lucide-react";
import { locationsData as staticLocationsData, mapServerLocationToClient } from "@/lib/locations-data";
import type { Location } from '@/lib/locations-data';
import { API_BASE_URL, getFullImageUrl } from '@/lib/utils';
import { useSiteContent } from '@/lib/site-content';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=800&auto=format&fit=crop&q=80';

export function LocationCardSkeleton() {
  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden bg-card border border-border/80 animate-pulse">
      {/* Thumbnail shimmer */}
      <div className="relative aspect-[16/10] bg-muted/60" />
      {/* Content shimmer */}
      <div className="p-5 flex flex-col flex-grow justify-between text-left space-y-4">
        <div className="space-y-2.5">
          <div className="h-5 bg-muted/70 rounded-md w-3/4" />
          <div className="h-3 bg-muted/50 rounded-md w-full" />
          <div className="h-3 bg-muted/50 rounded-md w-5/6" />
        </div>
        <div className="pt-3 border-t border-border/40 flex items-center justify-between">
          <div className="h-3 bg-muted/40 rounded-md w-1/3" />
          <div className="h-3.5 w-3.5 bg-muted/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}

const LocationCard = ({ location }: { location: Location }) => {
  const resolvedImage = getFullImageUrl(location.cardImage) || FALLBACK_IMAGE;
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link href={`/explore-ratnapura/${location.slug}`} className="group block h-full">
      <Card className="bg-card hover:bg-card/80 border border-border/80 hover:border-primary/50 transition-colors flex flex-col h-full rounded-2xl overflow-hidden group">
        
        {/* Card Thumbnail Box */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted/50">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted/60 animate-pulse" />
          )}
          <img
            src={resolvedImage}
            alt={location.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => { 
              (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; 
              setImageLoaded(true);
            }}
            className={`object-cover w-full h-full transition-all duration-700 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <Badge className="absolute top-3 left-3 bg-slate-950/85 text-primary border-primary/30 text-[11px] font-semibold uppercase tracking-wider">
            {location.category === 'agriculture' ? 'Gem Mining' : location.category === 'cultural' ? 'Cultural' : 'Nature'}
          </Badge>

          {location.distance && (
            <Badge variant="outline" className="absolute bottom-3 left-3 bg-slate-950/85 text-white border-white/20 text-[10px]">
              <MapPin className="h-3 w-3 mr-1 text-primary" />
              {location.distance}
            </Badge>
          )}
        </div>

        {/* Card Text Content */}
        <CardContent className="p-5 flex flex-col flex-grow justify-between text-left space-y-3">
          <div>
            <h3 className="text-lg sm:text-xl font-serif font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
              {location.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed font-light">
              {location.cardDescription}
            </p>
          </div>

          <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
            <span>Explore Attraction</span>
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1.5 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export function ExploreRatnapuraContent() {
  const { content } = useSiteContent();
  const catalogHeader = content.explore?.catalogHeader || {
    badge: 'Curated Destinations',
    heading: 'Discover Ratnapura Attractions',
    subtitle: 'From world-famous alluvial gem gravel pits to virgin rainforest sanctuaries and sacred temples.'
  };

  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch(`${API_BASE_URL}/locations`);
        if (!response.ok) {
          setAllLocations(staticLocationsData);
          return;
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          const serverLocations = data.map(mapServerLocationToClient);
          const combined = [...staticLocationsData, ...serverLocations];
          const uniqueLocations: { [key: string]: Location } = {};
          for (const loc of combined) {
            uniqueLocations[loc.slug] = loc;
          }
          setAllLocations(Object.values(uniqueLocations));
        } else {
          setAllLocations(staticLocationsData);
        }
      } catch (e) {
        setAllLocations(staticLocationsData);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLocations();
  }, []);

  const natureLocations = allLocations.filter(loc => loc.category === 'nature');
  const agricultureLocations = allLocations.filter(loc => loc.category === 'agriculture');
  const culturalLocations = allLocations.filter(loc => loc.category === 'cultural');

  return (
    <section className="w-full py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-3 bg-primary/10 border border-primary/20 px-3.5 py-1 rounded-full">
            <Compass className="h-3.5 w-3.5" />
            <span>{catalogHeader.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-wide text-foreground">
            {catalogHeader.heading}
          </h2>
          <p className="text-base text-muted-foreground mt-3 leading-relaxed">
            {catalogHeader.subtitle}
          </p>
        </div>


        {/* Category Tabs & Content */}
        {isLoading ? (
          <div className="space-y-10">
            {/* Skeleton Tabs Bar */}
            <div className="flex justify-center mb-10">
              <div className="h-10 max-w-2xl w-full bg-muted/40 rounded-xl animate-pulse border border-border/60" />
            </div>
            {/* 8-Card Shimmer Skeleton Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <LocationCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <div className="flex justify-center mb-10">
              <TabsList className="grid grid-cols-4 max-w-2xl w-full bg-background-alt border border-border p-1 rounded-xl">
                <TabsTrigger value="all" className="rounded-lg text-xs sm:text-sm">
                  All ({allLocations.length})
                </TabsTrigger>
                <TabsTrigger value="nature" className="rounded-lg text-xs sm:text-sm">
                  Nature ({natureLocations.length})
                </TabsTrigger>
                <TabsTrigger value="agriculture" className="rounded-lg text-xs sm:text-sm">
                  Gem Mining ({agricultureLocations.length})
                </TabsTrigger>
                <TabsTrigger value="cultural" className="rounded-lg text-xs sm:text-sm">
                  Cultural ({culturalLocations.length})
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* TAB ALL */}
            <TabsContent value="all" className="mt-0 animate-in fade-in-50 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allLocations.map((location) => (
                  <LocationCard key={location.slug} location={location} />
                ))}
              </div>
            </TabsContent>

            {/* TAB NATURE */}
            <TabsContent value="nature" className="mt-0 animate-in fade-in-50 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {natureLocations.map((location) => (
                  <LocationCard key={location.slug} location={location} />
                ))}
              </div>
            </TabsContent>
            
            {/* TAB AGRICULTURE */}
            <TabsContent value="agriculture" className="mt-0 animate-in fade-in-50 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {agricultureLocations.map((location) => (
                  <LocationCard key={location.slug} location={location} />
                ))}
              </div>
            </TabsContent>
            
            {/* TAB CULTURAL */}
            <TabsContent value="cultural" className="mt-0 animate-in fade-in-50 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {culturalLocations.map((location) => (
                  <LocationCard key={location.slug} location={location} />
                ))}
              </div>
            </TabsContent>

          </Tabs>
        )}
      </div>
    </section>
  );
}
