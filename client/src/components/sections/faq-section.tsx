"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollAnimate } from "@/components/shared/scroll-animate";
import { HelpCircle, Sparkles, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSiteContent, getWhatsappUrl, defaultSeoFaqs } from "@/lib/site-content";

export function FAQSection() {
  const { content } = useSiteContent();
  const faqHeader = content.homepage.faqHeader;
  const activeFaqs = (content.settings?.seo?.faqs && content.settings.seo.faqs.length > 0)
    ? content.settings.seo.faqs
    : defaultSeoFaqs;

  return (
    <section className="w-full bg-background-alt py-16 md:py-28 relative">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        
        {/* Header */}
        <ScrollAnimate className="text-center space-y-3 mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold uppercase tracking-wider text-primary font-sans">
            <HelpCircle className="h-3.5 w-3.5" />
            {faqHeader.tagline || 'Traveler Inquiries'}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-bold tracking-tight text-foreground">
            {faqHeader.heading || 'Frequently Asked Questions'}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 font-sans">
            {faqHeader.subtitle}
          </p>
        </ScrollAnimate>


        {/* Accordion List */}
        <ScrollAnimate>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {activeFaqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-background border border-border/80 rounded-xl px-5 py-1 shadow-sm transition-colors data-[state=open]:border-primary/50"
              >
                <AccordionTrigger className="text-left text-sm sm:text-base font-headline font-semibold text-foreground hover:text-primary transition-colors py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollAnimate>

        {/* Need More Assistance Box */}
        <ScrollAnimate className="mt-12 text-center p-6 rounded-2xl bg-background border border-border/70 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <h4 className="text-sm font-bold font-headline text-foreground">Have a specific question or custom itinerary?</h4>
            <p className="text-xs text-muted-foreground">Our luxury concierge team is available 24/7 on WhatsApp &amp; Phone.</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto text-xs h-9 border-primary/40 text-primary hover:bg-primary/10">
              <a href={getWhatsappUrl(content, 'Hello Sapphire Trails, I have a question regarding your tours.')} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                WhatsApp Us
              </a>
            </Button>
            <Button asChild size="sm" className="w-full sm:w-auto text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Link href="/contact">
                Contact Concierge
              </Link>
            </Button>
          </div>
        </ScrollAnimate>

      </div>
    </section>
  );
}
