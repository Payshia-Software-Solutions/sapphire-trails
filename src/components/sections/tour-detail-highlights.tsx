
import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon, Gem, Users, Mountain, Star, Coffee, BedDouble } from "lucide-react";
import type { TourHighlight } from "@/lib/packages-data";

interface TourDetailHighlightsProps {
  description: string;
  highlights: TourHighlight[];
}

const iconMap: { [key: string]: LucideIcon } = {
  Gem,
  Users,
  Mountain,
  Star,
  Coffee,
  BedDouble,
};


export function TourDetailHighlights({ description, highlights }: TourDetailHighlightsProps) {
  if (!highlights || highlights.length === 0) {
    return null;
  }
  
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-headline font-bold mb-4 text-primary sm:text-4xl">
            Tour Highlights
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed mb-12">
                {description}
            </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {highlights.map((highlight, index) => {
            const Icon = iconMap[highlight.icon];
            return (
              <Card key={index} className="bg-transparent border-0 shadow-none flex flex-col w-full text-center p-6 items-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-6">
                    {Icon && <Icon className="h-10 w-10 text-primary" />}
                </div>
                <CardContent className="p-0">
                  <h3 className="text-xl font-bold font-headline text-primary">{highlight.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{highlight.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
