'use client';

import React from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PageHero } from '@/components/shared/page-hero';
import { TrustSection } from '@/components/sections/TrustSection';
import { ProposalJourneyTimeline } from '@/components/sections/proposal-journey-timeline';
import { ProposalInquiryForm } from '@/components/sections/proposal-inquiry-form';
import { ProposalFaq } from '@/components/sections/proposal-faq';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gem, Sparkles, Clock, Truck, Heart, ArrowRight } from 'lucide-react';
import { useSiteContent, getSectionThemeClass, getWhatsappUrl } from '@/lib/site-content';

const defaultPillarIcons = [Gem, Sparkles, Clock, Truck];

export default function CustomProposalPackagePage() {
  const { content } = useSiteContent();
  const prop = content.proposal;
  const vis = prop.sectionVisibility || {};
  const sty = prop.sectionStyles || {};

  const breadcrumbs = [
    { label: 'Tours', href: '/tours' },
    { label: 'Proposal Package', href: '/custom-proposal-package' }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* 1. Hero Cinematic Page Hero */}
        {vis.hero !== false && (
          <div className={getSectionThemeClass(sty.hero)}>
            <PageHero 
              title={prop.hero?.title || "Custom Proposal & Bespoke Ring Package"} 
              badge={prop.hero?.tagline || "5-Day Atelier Engagement Ring Crafting"}
              subtitle={prop.hero?.subtitle || "Embark on a private VIP gem mine tour in Ratnapura, select your certified Ceylon sapphire directly at the source, and receive your handcrafted engagement ring in 5 working days."}
              breadcrumbs={breadcrumbs} 
            />
          </div>
        )}

        {/* 2. Overview Section */}
        {vis.overview !== false && (
          <section className={`w-full py-12 md:py-24 lg:py-32 ${getSectionThemeClass(sty.overview, 'bg-background')}`}>
            <div className="container mx-auto px-4 md:px-6">
              <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
                <div className="space-y-4 text-left">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-wide text-foreground">{prop.overview?.heading}</h2>
                  <h3 className="font-serif text-lg sm:text-xl tracking-[0.15em] uppercase text-primary/90">{prop.overview?.tagline}</h3>
                  <p className="text-muted-foreground leading-relaxed mt-4 font-light text-sm sm:text-base">
                    {prop.overview?.paragraph1}
                  </p>
                  <p className="text-muted-foreground leading-relaxed font-light text-sm sm:text-base">
                    {prop.overview?.paragraph2}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 h-11 text-xs font-semibold shadow-sm">
                      <a href="#inquiry">
                        <Heart className="mr-2 h-4 w-4" />
                        {prop.overview?.primaryButtonText || 'Inquire For Custom Quote'}
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="border border-border/80 hover:border-primary/50 text-foreground hover:bg-primary/10 rounded-full px-6 h-11 text-xs font-semibold bg-transparent transition-colors">
                      <a href={getWhatsappUrl(content, 'Hello Sapphire Trails, I am interested in the Custom Proposal Package.')} target="_blank" rel="noopener noreferrer">
                        {prop.overview?.secondaryButtonText || 'WhatsApp Concierge'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/80">
                    <Image
                      src={prop.overview?.image || "https://content-provider.payshia.com/sapphire-trail/images/tour-7-optimized.webp"}
                      alt="Custom sapphire selection and jewelry craftsmanship"
                      data-ai-hint="gem crafting"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. 4 Pillars Section */}
        {vis.pillars !== false && (
          <section className={`w-full py-12 md:py-24 lg:py-32 ${getSectionThemeClass(sty.pillars, 'bg-background-alt')}`}>
            <div className="container mx-auto px-4 md:px-6">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-wide text-foreground">{prop.pillars?.heading}</h2>
                <p className="mt-4 text-muted-foreground font-light text-sm sm:text-base">
                  {prop.pillars?.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {prop.pillars?.items?.map((item, index) => {
                  const Icon = defaultPillarIcons[index % defaultPillarIcons.length];
                  return (
                    <Card key={index} className="bg-card border border-border/80 flex flex-col w-full rounded-2xl overflow-hidden hover:border-primary/40 transition-colors">
                      <div className="relative aspect-[3/2] w-full">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="text-base font-serif font-medium text-foreground">{item.title}</h3>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light flex-grow">
                          {item.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 4. 5-Stage Journey Timeline */}
        {vis.timeline !== false && (
          <div className={getSectionThemeClass(sty.timeline)}>
            <ProposalJourneyTimeline />
          </div>
        )}

        {/* 5. Inquire-Based Form Section */}
        {vis.inquiry !== false && (
          <div className={getSectionThemeClass(sty.inquiry)}>
            <ProposalInquiryForm />
          </div>
        )}

        {/* 6. FAQ Section */}
        {vis.faq !== false && (
          <div className={getSectionThemeClass(sty.faq)}>
            <ProposalFaq />
          </div>
        )}
      </main>

      {/* 7. Trust Badges Section */}
      {vis.trust !== false && (
        <div className={getSectionThemeClass(sty.trust)}>
          <TrustSection />
        </div>
      )}
      <Footer />
    </div>
  );
}

