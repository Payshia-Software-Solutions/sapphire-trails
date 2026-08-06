
import { CheckCircle2 } from "lucide-react";

interface TourDetailInclusionsProps {
  inclusions: string[];
}

export function TourDetailInclusions({ inclusions }: TourDetailInclusionsProps) {
  if (!inclusions || inclusions.length === 0) return null;

  return (
    <section className="w-full py-10 md:py-14 bg-background-alt">
      <div className="container mx-auto px-4 md:px-10 max-w-screen-xl">

        {/* Section header */}
        <div className="max-w-2xl mb-6">
          <p className="text-primary font-serif uppercase tracking-widest text-xs mb-3">All-Inclusive</p>
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground leading-snug">
            What&apos;s Included
          </h2>
        </div>

        {/* Inclusions grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
          {inclusions.map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-foreground text-sm font-medium leading-snug">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
