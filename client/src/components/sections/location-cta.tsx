'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Phone, Calendar, MessageCircle, Sparkles, ShieldCheck } from "lucide-react";
import { useSiteContent, getContactPhone, getCleanPhone, getWhatsappUrl } from '@/lib/site-content';

interface LocationCtaProps {
  locationTitle?: string;
}

export function LocationCta({ locationTitle = 'Ratnapura' }: LocationCtaProps) {
  const { content } = useSiteContent();
  const primaryPhone = getContactPhone(content);
  const primaryPhoneTel = `tel:${getCleanPhone(primaryPhone)}`;

  return (
    <section id="book-experience" className="w-full py-20 sm:py-28 bg-[#080E18] relative overflow-hidden scroll-mt-28">
      {/* Subtle Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-900/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 text-center relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200 mb-3 bg-white/10 border border-white/15 px-3.5 py-1 rounded-full backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-blue-300" />
          <span>Curated Private Expeditions</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white mb-4 leading-tight">
          Ready to Experience {locationTitle}?
        </h2>

        <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed font-light">
          Let our private gemologist and luxury chauffeurs craft a bespoke itinerary tailored to your dates, preferences, and pace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button 
            asChild 
            size="lg" 
            className="w-full sm:w-auto bg-white hover:bg-slate-100 text-[#080E18] font-medium px-8 h-11 rounded-full text-sm shadow-sm"
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
            className="w-full sm:w-auto bg-white/10 hover:bg-white/15 border-white/20 text-white rounded-full h-11 px-6 backdrop-blur-md text-sm"
          >
            <a
              href={getWhatsappUrl(content, `Hello Sapphire Trails, I would like to book a private day tour to ${locationTitle}.`)}
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
            className="w-full sm:w-auto text-slate-300 hover:text-white rounded-full h-11 text-sm"
          >
            <a href={primaryPhoneTel}>
              <Phone className="mr-2 h-4 w-4 text-blue-300" />
              {primaryPhone}
            </a>
          </Button>
        </div>

        <div className="pt-8 mt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-light">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-blue-300" /> 100% Private Chauffeured Tour
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-blue-300" /> Certified Naturalist &amp; Gem Guides
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-blue-300" /> Flexible Free Cancellation
          </span>
        </div>
      </div>
    </section>
  );
}
