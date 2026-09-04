'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Route, ExternalLink, Phone, MessageCircle } from 'lucide-react';

import { useSiteContent } from '@/lib/site-content';

export function ContactMap() {
  const [isMapActive, setIsMapActive] = useState(false);
  const { content } = useSiteContent();
  const mapData = content.contact?.map || {
    badge: 'Visit Sapphire Trails',
    heading: 'Our Headquarters & Tour Lounge',
    subtitle: 'Conveniently situated at Grand Silver Ray on the Colombo-Batticaloa Highway, Ratnapura.',
    addressText: 'Grand Silver Ray, Colombo - Batticaloa Hwy, Ratnapura 70070, Sri Lanka',
    directionsUrl: 'https://maps.app.goo.gl/uX3rK6fDpzQZ6mZ46',
  };
  const whatsappNumber = content.contact?.whatsappNumber || '94712357700';

  return (
    <section id="our-location" className="w-full py-16 md:py-24 bg-background border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-2 bg-primary/10 border border-primary/20 px-3.5 py-1 rounded-full">
            <MapPin className="h-3.5 w-3.5" />
            <span>{mapData.badge}</span>
          </div>
          <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground sm:text-4xl">
            {mapData.heading}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mapData.subtitle}
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-4">
          <div
            className="relative rounded-2xl overflow-hidden border border-border shadow-xl h-[420px] sm:h-[500px] w-full bg-background-alt group"
            onClick={() => setIsMapActive(true)}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.918184840201!2d80.48564107549169!3d6.657062193337755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3eb9ab0fcd781%3A0xafc2aff7a4bb736f!2sSapphire%20Trails!5e0!3m2!1sen!2slk!4v1771163604693!5m2!1sen!2slk"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
            
            {/* Active Pin Badge */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <Badge className="bg-black/85 backdrop-blur-md text-white border-primary/40 text-xs px-3.5 py-1.5 gap-2 shadow-xl font-semibold">
                <MapPin className="h-3.5 w-3.5 text-primary animate-pulse" />
                Sapphire Trails HQ • Grand Silver Ray
              </Badge>
            </div>

            {!isMapActive && (
              <div className="absolute inset-0 bg-transparent cursor-pointer" />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-background-alt rounded-xl border border-border text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Navigation className="h-4 w-4 text-primary shrink-0" />
              <span>{mapData.addressText}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild className="text-primary hover:bg-primary/10 gap-1.5 text-xs h-8 border-primary/30">
                <a 
                  href={mapData.directionsUrl || 'https://maps.app.goo.gl/uX3rK6fDpzQZ6mZ46'} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  <Route className="h-3.5 w-3.5" />
                  Get Driving Directions
                </a>
              </Button>
              <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs h-8 font-semibold">
                <a 
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20Sapphire%20Trails%2C%20I%20would%20like%20directions%20to%20your%20Ratnapura%20lounge.`} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp Concierge
                </a>
              </Button>
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}

export { ContactMap as ExploreMap };
