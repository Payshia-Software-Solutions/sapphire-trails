'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Gem, AlertTriangle, Waves, Landmark, Home, Thermometer } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Attraction {
  icon: string;
  name: string;
  distance: string;
}

interface LocationNearbyProps {
  mapEmbedUrl: string;
  nearbyAttractions: Attraction[];
}

const iconMap: { [key: string]: LucideIcon } = {
  AlertTriangle,
  Gem,
  Waves,
  Landmark,
  Home,
  Thermometer,
};

export function LocationNearby({ mapEmbedUrl, nearbyAttractions }: LocationNearbyProps) {
  const [isMapActive, setIsMapActive] = useState(false);

  if (!mapEmbedUrl || !nearbyAttractions || nearbyAttractions.length === 0) {
    return null;
  }
  
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-headline font-bold text-center mb-12 text-primary sm:text-4xl">
          Location & Nearby Attractions
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div
            className="relative lg:col-span-2 rounded-lg overflow-hidden border border-border shadow-lg aspect-[3/2]"
            onClick={() => setIsMapActive(true)}
          >
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            ></iframe>
            {!isMapActive && (
              <div className="absolute inset-0 bg-transparent cursor-pointer"></div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-headline font-bold text-primary mb-4">Nearby Points of Interest</h3>
            <div className="space-y-4">
              {nearbyAttractions.map((attraction, index) => {
                const Icon = iconMap[attraction.icon];
                return (
                  <Card key={index} className="p-4 bg-card flex items-center gap-4 border-stone-800/50">
                    {Icon && <Icon className="h-6 w-6 text-primary flex-shrink-0" />}
                    <div>
                      <p className="font-semibold text-foreground">{attraction.name}</p>
                      <p className="text-sm text-muted-foreground">{attraction.distance}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
