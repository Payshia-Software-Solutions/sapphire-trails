'use client';

import { Card, CardContent } from "@/components/ui/card";
import { 
  Leaf, 
  Mountain, 
  Bird, 
  Home, 
  Clock, 
  CalendarDays, 
  Ticket, 
  Users, 
  AlertTriangle, 
  Gem, 
  Waves, 
  Landmark, 
  Camera, 
  Tent, 
  Thermometer, 
  MapPin, 
  Sparkles,
  Award,
  Compass
} from 'lucide-react';
import type { LucideIcon } from "lucide-react";

interface Highlight {
  icon: string;
  title: string;
  description: string;
}

interface LocationHighlightsProps {
  highlights: Highlight[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  Leaf,
  Mountain,
  Bird,
  Home,
  Clock,
  CalendarDays,
  Ticket,
  Users,
  AlertTriangle,
  Gem,
  Waves,
  Landmark,
  Camera,
  Tent,
  Thermometer,
  MapPin,
  Sparkles,
  Award,
  Compass
};

export function LocationHighlights({ highlights }: LocationHighlightsProps) {
  if (!highlights || highlights.length === 0) {
    return null;
  }
  
  return (
    <section id="highlights" className="w-full py-16 sm:py-24 bg-background-alt border-b border-border/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Unmatched Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground tracking-tight">
            Key Experience Highlights
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            What makes this destination an essential stop on your private Ceylon gem expedition.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((highlight, index) => {
            const Icon = ICON_MAP[highlight.icon] || Sparkles;
            return (
              <Card 
                key={index} 
                className="bg-card hover:bg-card/80 border-border/80 hover:border-primary/50 transition-all duration-300 rounded-2xl p-6 flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 mb-5">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold font-serif text-foreground mb-2 group-hover:text-primary transition-colors">
                    {highlight.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {highlight.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-border/40 flex items-center gap-1 text-[11px] font-semibold text-primary/80">
                  <span>Highlight #{index + 1}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
