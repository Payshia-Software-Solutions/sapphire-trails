'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ContactSection } from '@/components/sections/contact-section';
import { ContactMap } from '@/components/sections/contact-map';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import { PageHero } from '@/components/shared/page-hero';
import { ContactTours } from '@/components/sections/contact-tours';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TrustSection } from '@/components/sections/TrustSection';
import { useSiteContent, getSectionThemeClass } from '@/lib/site-content';

function DynamicFaqSection({ faqs, heading }: { faqs: Array<{ question: string; answer: string }>; heading?: string }) {
  if (!faqs || faqs.length === 0) return null;
  return (
    <section className="w-full py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-headline font-bold text-center mb-8 text-primary">
            {heading || 'Frequently Asked Questions'}
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b-white/10">
                <AccordionTrigger className="text-lg hover:no-underline text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
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

export default function ContactPage() {
  const breadcrumbs = [{ label: 'Contact', href: '/contact' }];
  const { content } = useSiteContent();
  const contact = content.contact;
  const vis = contact?.sectionVisibility || {};
  const sty = contact?.sectionStyles || {};

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Sapphire Trails",
    "image": "https://sapphiretrails.lk/img/logo4.png",
    "@id": "https://sapphiretrails.lk",
    "url": "https://sapphiretrails.lk/contact",
    "telephone": contact.primaryPhone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": contact.physicalAddress,
      "addressLocality": "Ratnapura",
      "addressCountry": "LK"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 6.657062,
      "longitude": 80.485641
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "08:00",
      "closes": "18:00"
    } 
  };
  
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <Header />
      <main className="flex-1">
        {/* 1. Hero Banner */}
        {vis.hero !== false && (
          <div className={getSectionThemeClass(sty.hero)}>
            <PageHero 
              title={contact.hero.title} 
              badge={contact.hero.tagline}
              subtitle={contact.hero.subtitle}
              breadcrumbs={breadcrumbs}
              backgroundImage={contact.hero.image || 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp'}
            />
          </div>
        )}

        {/* 2. Contact Channels & Booking Form */}
        {vis.channels !== false && (
          <div className={getSectionThemeClass(sty.channels)}>
            <ContactSection />
          </div>
        )}

        {/* 3. Interactive Google Map */}
        {vis.map !== false && (
          <div className={getSectionThemeClass(sty.map)}>
            <ContactMap />
          </div>
        )}

        {/* 4. FAQs Accordion */}
        {vis.faqs !== false && (
          <div className={getSectionThemeClass(sty.faqs)}>
            <DynamicFaqSection faqs={contact.faqs || []} heading={contact.faqsHeader?.heading} />
          </div>
        )}

        {/* 5. Recommended Tour Packages */}
        {vis.tours !== false && (
          <div className={getSectionThemeClass(sty.tours)}>
            <ScrollAnimate>
              <ContactTours />
            </ScrollAnimate>
          </div>
        )}
      </main>
      <TrustSection />
      <Footer />
    </div>
  );
}

