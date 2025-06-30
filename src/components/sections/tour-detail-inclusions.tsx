
import { Check } from "lucide-react";

interface TourDetailInclusionsProps {
    inclusions: string[];
}

export function TourDetailInclusions({ inclusions }: TourDetailInclusionsProps) {
  if (!inclusions || inclusions.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-headline font-bold mb-12 text-primary sm:text-4xl">
            What&apos;s Included
            </h2>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
            {inclusions.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground uppercase tracking-wider text-sm font-medium">{item}</span>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
