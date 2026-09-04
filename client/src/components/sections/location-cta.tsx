'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Phone, Calendar, MessageCircle, Sparkles, ShieldCheck } from "lucide-react";

interface LocationCtaProps {
  locationTitle?: string;
}

export function LocationCta({ locationTitle = 'Ratnapura' }: LocationCtaProps) {
  return (
    <section id="book-experience" className="w-full py-20 sm:py-28 bg-[#0d0f14] relative overflow-hidden scroll-mt-28">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-3 bg-primary/10 border border-primary/20 px-3.5 py-1 rounded-full">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Curated Private Expeditions</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold font-serif tracking-tight text-white mb-4 leading-tight">
          Ready to Experience {locationTitle}?
        </h2>

        <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed">
          Let our private gemologist and luxury chauffeurs craft a bespoke itinerary tailored to your dates, preferences, and pace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button 
            asChild 
            size="lg" 
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12 text-sm shadow-xl shadow-primary/20"
          >
            <Link href="/booking">
              <Calendar className="mr-2 h-4 w-4" />
              Book Private Tour
            </Link>
          </Button>

          <Button 
            asChild 
            size="lg" 
            variant="outline" 
            className="w-full sm:w-auto bg-black/40 border-white/20 text-white hover:text-primary hover:border-primary/50 h-12 text-sm px-6"
          >
            <a
              href={`https://wa.me/94712357700?text=${encodeURIComponent(`Hello Sapphire Trails, I would like to book a private day tour to ${locationTitle}.`)}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="mr-2 h-4 w-4 text-emerald-400" />
              WhatsApp Concierge
            </a>
          </Button>

          <Button 
            asChild 
            size="lg" 
            variant="ghost" 
            className="w-full sm:w-auto text-muted-foreground hover:text-white h-12 text-sm"
          >
            <a href="tel:+94712357700">
              <Phone className="mr-2 h-4 w-4" />
              +94 71 235 7700
            </a>
          </Button>
        </div>

        <div className="pt-8 mt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" /> 100% Private Chauffeured Tour
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" /> Certified Naturalist &amp; Gem Guides
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" /> Flexible Free Cancellation
          </span>
        </div>
      </div>
    </section>
  );
}
