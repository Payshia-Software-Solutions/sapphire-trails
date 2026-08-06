
import type { ItineraryItem } from "@/lib/packages-data";

interface TourDetailItineraryProps {
  itinerary: ItineraryItem[];
}

export function TourDetailItinerary({ itinerary }: TourDetailItineraryProps) {
  if (!itinerary || itinerary.length === 0) return null;

  return (
    <div id="itinerary" className="flex flex-col">
      {/* Column header */}
      <div className="mb-8">
        <p className="text-primary font-serif uppercase tracking-widest text-xs mb-2">Step by Step</p>
        <h2 className="text-2xl md:text-3xl font-headline font-bold text-foreground leading-snug">
          Your Day&apos;s Itinerary
        </h2>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {itinerary.map((item, index) => (
          <div key={index} className="relative flex gap-5">
            {/* Time + line */}
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center justify-center shrink-0 w-14 pt-1">
                <span className="text-sm font-bold text-primary font-serif leading-none">{item.time.split(' ')[0]}</span>
                <span className="text-xs text-muted-foreground">{item.time.split(' ').slice(1).join(' ')}</span>
              </div>
              {index < itinerary.length - 1 && (
                <div className="w-px flex-1 bg-border mt-2 min-h-[36px]" />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-5 ${index === itinerary.length - 1 ? 'pb-0' : ''}`}>
              <div className="absolute left-[52px] top-2 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background ring-2 ring-background" />
              <div className="ml-2 p-4 rounded-xl bg-background border border-border hover:border-primary/20 transition-colors">
                <h3 className="font-headline font-bold text-foreground text-sm mb-1">{item.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
