'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Sparkles, Calendar, MessageCircle, Navigation, ChevronRight, Compass, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFullImageUrl } from '@/lib/utils';

interface LocationHeroProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageHint?: string;
  distance?: string;
  category?: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=1600&auto=format&fit=crop&q=85';

export function LocationHero({ title, subtitle, imageUrl, imageHint, distance, category }: LocationHeroProps) {
  const resolvedImage = getFullImageUrl(imageUrl) || FALLBACK_IMAGE;

  return (
    <section className="relative w-full min-h-[70vh] lg:min-h-[75vh] flex flex-col justify-between overflow-hidden bg-[#0a0a0c]">
      {/* Background Image with Cinematic Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={resolvedImage}
          alt={`Scenic view of ${title}`}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
          className="w-full h-full object-cover object-center transform scale-105 animate-fade-in"
        />
        {/* Multilayer Luxury Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/60 to-black/40 z-10" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/30 to-black/80 z-10" />
      </div>

      {/* Top Breadcrumbs */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 pt-24 pb-4">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground/80 font-medium">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
          <Link href="/explore-ratnapura" className="hover:text-primary transition-colors">Explore Ratnapura</Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
          <span className="text-primary font-semibold truncate max-w-[200px] sm:max-w-none">{title}</span>
        </nav>
      </div>

      {/* Hero Center Content */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col justify-center items-center text-center max-w-4xl">
        
        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <Badge className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/40 px-3 py-1 text-xs uppercase tracking-widest font-semibold backdrop-blur-md">
            <Sparkles className="h-3 w-3 mr-1.5" />
            {category === 'agriculture' ? 'Gem Mining & Heritage' : category === 'cultural' ? 'Cultural Landmark' : 'Natural Wonder'}
          </Badge>
          {distance && (
            <Badge variant="outline" className="bg-black/50 text-foreground border-white/20 px-3 py-1 text-xs backdrop-blur-md">
              <MapPin className="h-3 w-3 mr-1.5 text-primary" />
              {distance}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white font-serif drop-shadow-lg leading-tight mb-4">
          {title}
        </h1>

        {/* Subtitle / Tagline */}
        {subtitle && (
          <p className="text-lg sm:text-2xl text-amber-100/90 font-serif italic tracking-wide max-w-2xl drop-shadow mb-8 leading-relaxed">
            &ldquo;{subtitle}&rdquo;
          </p>
        )}

        {/* Quick Action Buttons (Easy Access) */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-xl">
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-xl shadow-primary/25 text-sm h-12"
          >
            <Link href="/booking">
              <Calendar className="mr-2 h-4 w-4" />
              Book a Tour Including Here
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="bg-black/40 hover:bg-black/70 border-white/30 text-white hover:text-primary backdrop-blur-md text-sm h-12 px-5"
          >
            <a
              href={`https://wa.me/94712357700?text=${encodeURIComponent(`Hello Sapphire Trails, I am interested in visiting ${title} in Ratnapura. Can you arrange a private tour?`)}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="mr-2 h-4 w-4 text-emerald-400" />
              WhatsApp Guide
            </a>
          </Button>
        </div>

      </div>
    </section>
  );
}
