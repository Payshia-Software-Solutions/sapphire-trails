import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Mountain, Bird, Home } from 'lucide-react';
import { type LucideIcon } from "lucide-react";

interface Highlight {
  icon: string;
  title: string;
  description: string;
}

interface LocationHighlightsProps {
  highlights: Highlight[];
}

const iconMap: { [key: string]: LucideIcon } = {
  Leaf,
  Mountain,
  Bird,
  Home,
};


export function LocationHighlights({ highlights }: LocationHighlightsProps) {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-headline font-bold text-center mb-12 text-primary sm:text-4xl">
          Key Highlights
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((highlight, index) => {
            const Icon = iconMap[highlight.icon];
            return (
              <Card key={index} className="bg-card border-stone-800/50 flex flex-col w-full rounded-xl overflow-hidden shadow-lg text-center p-6 items-center">
                {Icon && <Icon className="h-12 w-12 text-primary mb-4" />}
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