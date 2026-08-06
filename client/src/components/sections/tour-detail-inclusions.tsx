
import { CheckCircle2 } from "lucide-react";

interface TourDetailInclusionsProps {
  inclusions: string[];
}

export function TourDetailInclusions({ inclusions }: TourDetailInclusionsProps) {
  if (!inclusions || inclusions.length === 0) return null;

  return (
    <div className="flex flex-col">
      {/* Column header */}
      <div className="mb-8">
        <p className="text-primary font-serif uppercase tracking-widest text-xs mb-2">All-Inclusive</p>
        <h2 className="text-2xl md:text-3xl font-headline font-bold text-foreground leading-snug">
          What&apos;s Included
        </h2>
      </div>

      {/* Inclusions list */}
      <div className="flex flex-col gap-3">
        {inclusions.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border hover:border-primary/20 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-foreground text-sm font-medium leading-snug">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
