'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useSiteContent } from '@/lib/site-content';

export function ProposalFaq() {
  const { content } = useSiteContent();
  const faqData = content.proposal?.faqs;
  const faqsList = faqData?.items || [];

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-wide text-center mb-10 text-foreground">
            {faqData?.heading || 'Proposal Package FAQ'}
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqsList.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/80">
                <AccordionTrigger className="text-base sm:text-lg font-serif font-medium hover:no-underline text-left text-foreground hover:text-primary transition-colors">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2 leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

