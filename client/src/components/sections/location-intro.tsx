'use client';

import { MapPin, Sparkles, Compass, CheckCircle } from 'lucide-react';
import { getFullImageUrl } from '@/lib/utils';

interface LocationIntroProps {
  distance: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint?: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=800&auto=format&fit=crop&q=80';

export function LocationIntro({ distance, title, description, imageUrl, imageHint }: LocationIntroProps) {
  const resolvedImage = getFullImageUrl(imageUrl) || FALLBACK_IMAGE;

  return (
    <section id="overview" className="w-full py-16 sm:py-24 bg-background border-b border-border/60 scroll-mt-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Editorial Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-semibold text-primary">
              <MapPin className="h-3.5 w-3.5" />
              <span>{distance || 'Ratnapura, Sri Lanka'}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-foreground leading-tight tracking-tight">
              {title}
            </h2>

            <div className="w-16 h-1 bg-primary rounded-full" />

            <div className="prose prose-invert max-w-none text-muted-foreground text-base sm:text-lg leading-relaxed whitespace-pre-line font-sans">
              {description}
            </div>
          </div>

          {/* Right: Premium Framed Feature Visual */}
          <div className="lg:col-span-5">
            <div className="relative group p-2 bg-gradient-to-b from-primary/30 via-border/40 to-transparent rounded-2xl shadow-2xl">
              <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden rounded-xl bg-background-alt">
                <img
                  src={resolvedImage}
                  alt={title}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-white">
                  <p className="text-xs font-serif italic text-amber-200 truncate">
                    &ldquo;{title}&rdquo;
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Captured on Sapphire Trails Private Expeditions
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
