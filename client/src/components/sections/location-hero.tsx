'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, MessageCircle, Navigation, ChevronRight, Compass, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFullImageUrl } from '@/lib/utils';
import { useSiteContent, getWhatsappUrl } from '@/lib/site-content';

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
  const { content } = useSiteContent();
  const resolvedImage = getFullImageUrl(imageUrl) || FALLBACK_IMAGE;

  return (
    <section className="relative w-full min-h-[65vh] lg:min-h-[70vh] flex flex-col justify-between overflow-hidden bg-[#080E18]">
      {/* Ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-900/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Background Image with Cinematic Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={resolvedImage}
          alt={`Scenic view of ${title}`}
          fetchPriority="high"
          decoding="async"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
          className="w-full h-full object-cover object-center opacity-40 animate-fade-in"
        />
        {/* Subtle Minimalist Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080E18] via-[#080E18]/60 to-black/50 z-10" />
      </div>

      {/* Top Breadcrumbs */}
      <div className="relative z-20 container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 pt-24 pb-4">
        <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <Link href="/explore-ratnapura" className="hover:text-white transition-colors">Explore Ratnapura</Link>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <span className="text-blue-300 font-semibold truncate max-w-[200px] sm:max-w-none">{title}</span>
        </nav>
      </div>

      {/* Hero Center Content */}
      <div className="relative z-20 container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col justify-center items-center text-center max-w-4xl">
        
        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-5">
          <Badge className="bg-white/10 hover:bg-white/15 text-blue-200 border-white/15 px-3.5 py-1 text-xs uppercase tracking-[0.18em] font-semibold backdrop-blur-md rounded-full">
            <Compass className="h-3 w-3 mr-1.5 text-blue-300" />
            {category === 'agriculture' ? 'Gem Mining & Heritage' : category === 'cultural' ? 'Cultural Landmark' : 'Natural Wonder'}
          </Badge>
          {distance && (
            <Badge variant="outline" className="bg-white/5 text-slate-300 border-white/15 px-3.5 py-1 text-xs rounded-full backdrop-blur-md">
              <MapPin className="h-3 w-3 mr-1.5 text-blue-300" />
              {distance}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-tight mb-4">
          {title}
        </h1>

        {/* Subtitle / Tagline */}
        {subtitle && (
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mb-8 leading-relaxed font-light">
            &ldquo;{subtitle}&rdquo;
          </p>
        )}

        {/* Quick Action Buttons (Easy Access) */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-xl">
          <Button
            asChild
            size="lg"
            className="bg-white hover:bg-slate-100 text-[#080E18] font-medium px-8 h-11 rounded-full shadow-sm text-sm"
          >
            <Link href="/booking">
              <Calendar className="mr-2 h-4 w-4" />
              Book Tour Including Here
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="bg-white/10 hover:bg-white/15 border-white/20 text-white rounded-full h-11 px-6 backdrop-blur-md text-sm"
          >
            <a
              href={getWhatsappUrl(content, `Hello Sapphire Trails, I am interested in visiting ${title} in Ratnapura. Can you arrange a private tour?`)}
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
