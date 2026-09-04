import type { ItineraryItem } from "@/lib/packages-data";
import { Clock, MapPin, CheckCircle, Navigation, Sparkles } from "lucide-react";

interface TourDetailItineraryProps {
  itinerary: ItineraryItem[];
}

export function TourDetailItinerary({ itinerary }: TourDetailItineraryProps) {
  if (!itinerary || itinerary.length === 0) return null;

  return (
    <div id="itinerary" className="flex flex-col space-y-6 scroll-mt-28">
      
      {/* Column Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-2">
          <Clock className="h-3.5 w-3.5" />
          <span>Curated Timeline</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
          Step-by-Step Daily Itinerary
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          A seamlessly paced itinerary tailored for comfort, depth, and discovery.
        </p>
      </div>

      {/* Luxury Timeline Container */}
      <div className="space-y-3.5 sm:space-y-4 pt-2">
        {itinerary.map((item, index) => (
          <div 
            key={index} 
            className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-6 p-4 sm:p-5 rounded-2xl bg-background border border-border/80 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
          >
            {/* Time Badge Column */}
            <div className="flex items-center sm:flex-col sm:items-center shrink-0 gap-2 sm:gap-0 sm:w-24">
              <div className="px-2.5 py-0.5 sm:py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] sm:text-xs font-mono font-bold whitespace-nowrap">
                {item.time}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest sm:mt-1 font-semibold">
                Step 0{index + 1}
              </div>
            </div>

            {/* Content Column */}
            <div className="flex-1 space-y-1">
              <h3 className="font-serif font-bold text-foreground text-sm sm:text-base group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
