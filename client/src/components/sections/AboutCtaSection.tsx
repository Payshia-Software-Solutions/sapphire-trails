'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, ArrowRight, ShieldCheck } from "lucide-react";
import { useSiteContent, getWhatsappUrl, getContactPhone } from '@/lib/site-content';

export function AboutCtaSection() {
  const { content } = useSiteContent();
  const cta = content.about.cta;

  return (
    <section className="w-full py-16 md:py-24 bg-[#080E18] text-white relative overflow-hidden border-t border-white/10 font-sans">
      {/* Background Subtle Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-900/15 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="container relative z-10 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium uppercase tracking-[0.18em] text-blue-200 shadow-2xs mb-6">
          <span>{cta.tagline || 'Curate Your Once-in-a-Lifetime Adventure'}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-sans font-bold tracking-tight text-white mb-4 leading-tight">
          {cta.heading}
        </h2>

        <p className="mx-auto max-w-2xl text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed font-normal mb-8">
          {cta.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            asChild 
            size="lg"
            className="w-full sm:w-auto h-11 px-8 bg-white hover:bg-slate-100 text-[#080E18] font-semibold rounded-full shadow-lg gap-2 text-xs sm:text-sm transition-all border border-white"
          >
            <Link href="/booking">
              <span>{cta.primaryButtonText || 'Book Your Private Gem Tour'}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-11 px-8 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium rounded-full text-xs sm:text-sm gap-2 transition-colors"
          >
            <a
              href={getWhatsappUrl(content, 'Hello, I would like to customize a private gem tour with Sapphire Trails.')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <span>{cta.secondaryButtonText || `Chat on WhatsApp (${getContactPhone(content)})`}</span>
            </a>
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-sans">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-blue-300" /> Instant Confirmation
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-blue-300" /> 100% Tailored Itineraries
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-blue-300" /> Free Date Rescheduling
          </span>
        </div>
      </div>
    </section>
  );
}
