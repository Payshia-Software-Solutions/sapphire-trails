'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Faq } from '@/components/sections/faq';
import { ToursHeroSection } from '@/components/sections/tours-hero';
import { AllToursGrid } from '@/components/sections/all-tours-grid';
import { ToursGuaranteesSection } from '@/components/sections/ToursGuaranteesSection';
import { TrustSection } from '@/components/sections/TrustSection';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Gem, Clock, ArrowRight, Truck, MessageSquare } from 'lucide-react';
import { useSiteContent, getSectionThemeClass } from '@/lib/site-content';

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What should I bring for the mine tour?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We recommend comfortable clothing, closed-toe shoes, sunscreen, a hat, and a reusable water bottle. Safety gear such as helmets and harnesses will be provided. Don't forget your camera to capture the moments!"
      }
    },
    {
      "@type": "Question",
      "name": "Is the tour suitable for children?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our tours are family-friendly. However, due to the nature of the gem mines, there may be some areas with restricted access for young children. Please contact our concierge for specific family arrangements."
      }
    }
  ]
};

export default function ToursPage() {
  const breadcrumbs = [{ label: 'Tours', href: '/tours' }];
  const { content } = useSiteContent();
  const tours = content.tours;
  const proposalCallout = tours.proposalCallout;
  const vis = tours.sectionVisibility || {};
  const sty = tours.sectionStyles || {};
  
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <Header />
      <main className="flex-1">
        {/* 1. Proportional Luxury Tours Hero */}
        {vis.hero !== false && (
          <div className={getSectionThemeClass(sty.hero)}>
            <ToursHeroSection breadcrumbs={breadcrumbs} />
          </div>
        )}

        {/* 2. Featured Custom Proposal Callout Banner */}
        {vis.proposalCallout !== false && (
          <div className={getSectionThemeClass(sty.proposalCallout, 'w-full bg-background pt-10 pb-4')}>
            <div className="container mx-auto px-4 md:px-6 max-w-screen-2xl">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-background-alt to-card border border-primary/40 p-8 md:p-10 shadow-xl shadow-primary/5">
                <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="space-y-4 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs uppercase tracking-widest font-serif">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{proposalCallout.badge || 'Special Experience'}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-headline font-bold text-foreground leading-tight">
                      {proposalCallout.title}
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-light">
                      {proposalCallout.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-serif uppercase tracking-wider text-primary pt-1">
                      <span className="flex items-center gap-1.5"><Gem className="h-4 w-4" /> Mine Sourcing</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> 5-Day Atelier Crafting</span>
                      <span className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> Insured Delivery</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-12 rounded-full px-8 shadow-md">
                      <Link href="/custom-proposal-package">
                        {proposalCallout.primaryButtonText || 'Explore Proposal Package'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="border-primary/50 text-primary hover:bg-primary/10 font-semibold text-xs h-12 rounded-full px-8">
                      <a href="https://wa.me/94712357700?text=Hello%2C%20I%20am%20interested%20in%20the%20Custom%20Proposal%20Package." target="_blank" rel="noopener noreferrer">
                        <MessageSquare className="mr-1.5 h-4 w-4 text-emerald-500" />
                        {proposalCallout.secondaryButtonText || 'WhatsApp Concierge'}
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Main Filterable Tour Grid */}
        {vis.grid !== false && (
          <div className={getSectionThemeClass(sty.grid)}>
            <AllToursGrid />
          </div>
        )}

        {/* 4. Guarantees & Standard Inclusions Strip */}
        {vis.guarantees !== false && (
          <div className={getSectionThemeClass(sty.guarantees)}>
            <ToursGuaranteesSection />
          </div>
        )}

        {/* 5. Frequently Asked Questions */}
        {vis.faqs !== false && (
          <div className={getSectionThemeClass(sty.faqs)}>
            <Faq />
          </div>
        )}
      </main>

      {/* 6. Global Trust Strip & Footer */}
      <TrustSection />
      <Footer />
    </div>
  );
}

