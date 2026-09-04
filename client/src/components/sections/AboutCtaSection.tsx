'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, MessageSquare, ArrowRight, ShieldCheck } from "lucide-react";
import { useSiteContent } from '@/lib/site-content';

export function AboutCtaSection() {
  const { content } = useSiteContent();
  const cta = content.about.cta;

  return (
    <section className="w-full py-16 md:py-24 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-slate-950 to-slate-950 pointer-events-none" />
      
      <div className="container relative z-10 mx-auto px-4 md:px-6 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs font-semibold text-primary mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{cta.tagline || 'Curate Your Once-in-a-Lifetime Adventure'}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold tracking-tight text-white mb-6 leading-tight">
          {cta.heading}
        </h2>

        <p className="mx-auto max-w-2xl text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed font-light mb-10">
          {cta.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            asChild 
            size="lg"
            className="w-full sm:w-auto h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full shadow-lg gap-2 text-sm md:text-base group"
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
            className="w-full sm:w-auto h-12 px-8 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-white font-medium rounded-full text-sm md:text-base gap-2 backdrop-blur-sm"
          >
            <a
              href="https://wa.me/94712357700?text=Hello%2C%20I%20would%20like%20to%20customize%20a%20private%20gem%20tour%20with%20Sapphire%20Trails."
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <span>{cta.secondaryButtonText || 'Chat on WhatsApp (+94 71 235 7700)'}</span>
            </a>
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" /> Instant Confirmation
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" /> 100% Tailored Itineraries
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" /> Free Date Rescheduling
          </span>
        </div>
      </div>
    </section>
  );
}
