
import type { ItineraryItem } from "@/lib/packages-data";

interface TourDetailItineraryProps {
  itinerary: ItineraryItem[];
}

export function TourDetailItinerary({ itinerary }: TourDetailItineraryProps) {
  if (!itinerary || itinerary.length === 0) return null;

  return (
    <section className="w-full py-10 md:py-14 bg-background">
      <div className="container mx-auto px-4 md:px-10 max-w-screen-xl">

        {/* Section header */}
        <div className="max-w-2xl mb-8">
          <p className="text-primary font-serif uppercase tracking-widest text-xs mb-3">Step by Step</p>
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground leading-snug">
            Your Day&apos;s Itinerary
          </h2>
        </div>

        {/* Timeline */}
        <div className="max-w-3xl space-y-0">
          {itinerary.map((item, index) => (
            <div key={index} className="relative flex gap-6">
              {/* Left: time column with timeline line */}
              <div className="flex flex-col items-center">
                {/* Time badge */}
                <div className="flex flex-col items-center justify-center shrink-0 w-16 pt-1">
                  <span className="text-base font-bold text-primary font-serif leading-none">{item.time.split(' ')[0]}</span>
                  <span className="text-xs text-muted-foreground">{item.time.split(' ').slice(1).join(' ')}</span>
                </div>
                {/* Connector line */}
                {index < itinerary.length - 1 && (
                  <div className="w-px flex-1 bg-border mt-2 mb-0 min-h-[40px]" />
                )}
              </div>

              {/* Right: content */}
              <div className={`flex-1 pb-10 ${index === itinerary.length - 1 ? 'pb-0' : ''}`}>
                {/* Dot */}
                <div className="absolute left-[58px] top-2 h-3 w-3 rounded-full border-2 border-primary bg-background ring-4 ring-background" />
                <div className="ml-2 p-5 rounded-2xl bg-background-alt border border-border hover:border-primary/20 transition-colors">
                  <h3 className="font-headline font-bold text-foreground text-base mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
