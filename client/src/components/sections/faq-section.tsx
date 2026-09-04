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
import { useSiteContent } from "@/lib/site-content";

const faqs = [

  {
    q: "Is it safe to descend into the active gem mines?",
    a: "Yes, 100%. We operate strictly with government-licensed, timber-reinforced traditional mines inspected for structural integrity. Every guest is outfitted with safety harnesses, hard hats, and LED headlamps. You are guided one-on-one by our veteran mining team and licensed guide throughout the descent."
  },
  {
    q: "Can I keep the gemstones I find while washing the gravel?",
    a: "Absolutely! Any semi-precious gemstones (such as tourmalines, garnets, zircons, and quartz) and raw minerals you discover during your hands-on traditional gravel washing experience are yours to keep as authentic Sri Lankan souvenirs. If you uncover a high-value precious sapphire, our gemologist will assist with valuation and export certification."
  },
  {
    q: "Do you offer private hotel pickup from Colombo, Kandy, or Galle?",
    a: "Yes. All our signature and custom tour packages include private round-trip transfers in air-conditioned luxury SUVs or passenger vans directly from your hotel or resort in Colombo, Kandy, Galle, Bentota, or Bandaranaike International Airport (CMB)."
  },
  {
    q: "What is the recommended dress code for the gem mine tour?",
    a: "We recommend comfortable, lightweight cotton clothing that you don't mind getting slightly dusty or splashed with river water. Closed-toe walking shoes or sneakers are mandatory for pit descents. We provide specialized safety boots and rain boots for the riverbed gravel washing experience."
  },
  {
    q: "Can I buy certified Ceylon Sapphires or custom jewellery during the tour?",
    a: "Yes. At the conclusion of your tour at Grand Silver Ray, you can visit our certified gemological laboratory. You can select unheated or heated natural Ceylon Blue, Padparadscha, Pink, and Yellow sapphires accompanied by recognized international laboratory certificates (GIA, GIC, Lotus)."
  },
  {
    q: "What is your booking flexibility and cancellation policy?",
    a: "We offer flexible rescheduling. If your travel plans change due to weather or flight adjustments, you can reschedule your expedition free of charge with 24 hours notice. Advance deposit refunds are processed according to our transparent concierge terms."
  }
];

export function FAQSection() {
  const { content } = useSiteContent();
  const faqHeader = content.homepage.faqHeader;

  return (
    <section className="w-full bg-background-alt py-16 md:py-28 relative">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        
        {/* Header */}
        <ScrollAnimate className="text-center space-y-3 mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold uppercase tracking-wider text-primary">
            <HelpCircle className="h-3.5 w-3.5" />
            {faqHeader.tagline || 'Traveler Inquiries'}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary">
            {faqHeader.heading || 'Frequently Asked Questions'}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            {faqHeader.subtitle}
          </p>
        </ScrollAnimate>


        {/* Accordion List */}
        <ScrollAnimate>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-background border border-border/80 rounded-xl px-5 py-1 shadow-sm transition-colors data-[state=open]:border-primary/50"
              >
                <AccordionTrigger className="text-left text-sm sm:text-base font-headline font-semibold text-foreground hover:text-primary transition-colors py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1 pb-4">
                  {faq.a}
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
              <a href="https://wa.me/94712357700" target="_blank" rel="noopener noreferrer">
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
