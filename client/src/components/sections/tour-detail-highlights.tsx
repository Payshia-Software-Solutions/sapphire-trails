import { 
  type LucideIcon, 
  Gem, 
  Users, 
  Mountain, 
  Star, 
  Coffee, 
  BedDouble, 
  Leaf, 
  Bird, 
  Home, 
  Clock, 
  CalendarDays, 
  Ticket, 
  AlertTriangle, 
  Waves, 
  Landmark, 
  Camera, 
  Tent, 
  Thermometer, 
  MapPin, 
  Award, 
  Package, 
  Utensils, 
  Shield,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import type { TourHighlight } from "@/lib/packages-data";

interface TourDetailHighlightsProps {
  description: string;
  highlights: TourHighlight[];
}

const iconMap: { [key: string]: LucideIcon } = {
  Gem, Users, Mountain, Star, Coffee, BedDouble, Leaf, Bird, Home, Clock,
  CalendarDays, Ticket, AlertTriangle, Waves, Landmark, Camera, Tent,
  Thermometer, MapPin, Award, Package, Utensils, Shield, Sparkles
};

export function TourDetailHighlights({ description, highlights }: TourDetailHighlightsProps) {
  return (
    <section id="highlights" className="w-full py-16 sm:py-24 bg-background border-b border-border/80 scroll-mt-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl">

        {/* Section Header & Editorial Narrative */}
        <div className="max-w-3xl mb-12 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3.5 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Sapphire Trails Experience</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground tracking-tight">
            Key Experience Highlights
          </h2>

          {description && (
            <div className="text-muted-foreground text-base sm:text-lg leading-relaxed whitespace-pre-line pt-2">
              {description}
            </div>
          )}
        </div>

        {/* Highlights Grid */}
        {highlights && highlights.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((highlight, index) => {
              const Icon = iconMap[highlight.icon] || Gem;
              return (
                <div
                  key={index}
                  className="group relative p-6 rounded-2xl bg-background-alt border border-border/80 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <div>
                      <h3 className="font-serif font-bold text-foreground text-lg mb-1.5 group-hover:text-primary transition-colors">
                        {highlight.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {highlight.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/40 flex items-center gap-1.5 text-[11px] font-semibold text-primary/80">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    <span>Included in Private Excursion</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
