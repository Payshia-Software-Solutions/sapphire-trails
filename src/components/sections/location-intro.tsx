import Image from 'next/image';
import { MapPin } from 'lucide-react';

interface LocationIntroProps {
  distance: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

export function LocationIntro({ distance, title, description, imageUrl, imageHint }: LocationIntroProps) {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
              <MapPin className="mr-2 h-4 w-4" />
              {distance}
            </div>
            <h2 className="text-3xl font-headline font-bold text-primary sm:text-4xl">
              {title}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <Image
              src={imageUrl}
              alt={title}
              data-ai-hint={imageHint}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
