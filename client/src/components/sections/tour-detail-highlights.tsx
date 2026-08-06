
import { type LucideIcon, Gem, Users, Mountain, Star, Coffee, BedDouble, Leaf, Bird, Home, Clock, CalendarDays, Ticket, AlertTriangle, Waves, Landmark, Camera, Tent, Thermometer, MapPin, Award, Package, Utensils, Shield } from "lucide-react";
import type { TourHighlight } from "@/lib/packages-data";

interface TourDetailHighlightsProps {
  description: string;
  highlights: TourHighlight[];
}

const iconMap: { [key: string]: LucideIcon } = {
  Gem, Users, Mountain, Star, Coffee, BedDouble, Leaf, Bird, Home, Clock,
  CalendarDays, Ticket, AlertTriangle, Waves, Landmark, Camera, Tent,
  Thermometer, MapPin, Award, Package, Utensils, Shield,
};

export function TourDetailHighlights({ description, highlights }: TourDetailHighlightsProps) {
  if (!highlights || highlights.length === 0) return null;

  return (
    <section className="w-full py-10 md:py-14 bg-background">
      <div className="container mx-auto px-4 md:px-10 max-w-screen-xl">

        {/* Section header */}
        <div className="max-w-2xl mb-8">
          <p className="text-primary font-serif uppercase tracking-widest text-xs mb-2">About This Tour</p>
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground leading-snug mb-5">
            Tour Highlights
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {description}
          </p>
        </div>

        {/* Highlights grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((highlight, index) => {
            const Icon = iconMap[highlight.icon];
            return (
              <div
                key={index}
                className="group flex gap-5 p-6 rounded-2xl bg-background-alt border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                <div className="shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  {Icon && <Icon className="h-6 w-6 text-primary" />}
                </div>
                <div>
                  <h3 className="font-headline font-bold text-foreground text-base mb-1">{highlight.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{highlight.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
