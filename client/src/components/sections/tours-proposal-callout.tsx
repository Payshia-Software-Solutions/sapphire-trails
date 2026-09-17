'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gem, Clock, ArrowRight, Truck, MessageSquare } from 'lucide-react';
import { useSiteContent, getSectionThemeClass, getWhatsappUrl } from '@/lib/site-content';

export function ToursProposalCallout() {
  const { content } = useSiteContent();
  const tours = content.tours;
  const proposalCallout = tours.proposalCallout;
  const vis = tours.sectionVisibility || {};
  const sty = tours.sectionStyles || {};

  if (vis.proposalCallout === false) return null;

  return (
    <div className={getSectionThemeClass(sty.proposalCallout, 'w-full bg-background pt-10 pb-4')}>
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 p-8 md:p-10 shadow-xs">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 font-sans">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1E38]/5 dark:bg-white/5 border border-[#0B1E38]/15 dark:border-white/15 text-xs font-medium uppercase tracking-[0.18em] text-[#0B1E38] dark:text-blue-200 shadow-2xs">
                <span>{proposalCallout?.badge || 'Special Experience'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold tracking-tight text-foreground leading-tight">
                {proposalCallout?.title || 'Bespoke Proposal Ring Package'}
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed font-sans font-normal">
                {proposalCallout?.description || 'From raw pit extraction to precision atelier crafting. Experience the ultimate romantic journey in Ratnapura.'}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-sans uppercase tracking-wider text-[#0B1E38] dark:text-blue-300 pt-1 font-medium">
                <span className="flex items-center gap-1.5"><Gem className="h-4 w-4" /> Mine Sourcing</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> 5-Day Atelier Crafting</span>
                <span className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> Insured Delivery</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
              <Button asChild size="lg" className="bg-[#0B1E38] hover:bg-[#071527] text-white font-medium text-xs sm:text-sm h-11 px-8 rounded-full shadow-sm transition-all border border-[#0B1E38]">
                <Link href="/custom-proposal-package">
                  {proposalCallout?.primaryButtonText || 'Explore Proposal Package'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border border-border/80 hover:border-[#0B1E38]/40 text-foreground font-medium text-xs sm:text-sm h-11 rounded-full px-8 bg-transparent transition-colors">
                <a href={getWhatsappUrl(content, 'Hello, I am interested in the Custom Proposal Package.')} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="mr-1.5 h-4 w-4 text-emerald-500" />
                  {proposalCallout?.secondaryButtonText || 'WhatsApp Concierge'}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
