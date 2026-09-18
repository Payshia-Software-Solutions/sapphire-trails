import type { Metadata } from 'next';
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
import { fetchSiteContentServer, getSectionThemeClass } from '@/lib/site-content';
import { fetchTourPackages } from '@/lib/packages-data';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Contact Sapphire Trails | Inquire & Book Ratnapura Gem Tours',
  description: 'Get in touch with our gemological concierge. Book private sapphire mine tours, custom ring consultations, and inquire about Ratnapura expeditions.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Sapphire Trails | Inquire & Book Ratnapura Gem Tours',
    description: 'Direct contact details, WhatsApp concierge, and inquiry booking form for Sapphire Trails in Ratnapura, Sri Lanka.',
    url: 'https://sapphiretrails.lk/contact',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
      width: 1200,
      height: 630,
      alt: 'Contact Sapphire Trails Concierge',
    }],
  },
};

function DynamicFaqSection({ faqs, heading }: { faqs: Array<{ question: string; answer: string }>; heading?: string }) {
  if (!faqs || faqs.length === 0) return null;
  return (
    <section className="w-full py-16 md:py-24 bg-background">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0B1E38]/80 dark:text-blue-400">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
              {heading || 'Frequently Asked Questions'}
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/80">
                <AccordionTrigger className="text-base sm:text-lg font-medium hover:no-underline text-left text-foreground hover:text-[#0B1E38] dark:hover:text-blue-400 transition-colors py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-1 pb-4 leading-relaxed font-light text-sm sm:text-base">
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

export default async function ContactPage() {
  const breadcrumbs = [{ label: 'Contact', href: '/contact' }];
  const [content, initialTours] = await Promise.all([
    fetchSiteContentServer(),
    fetchTourPackages(3600),
  ]);
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
              <ContactTours initialTours={initialTours} />
            </ScrollAnimate>
          </div>
        )}
      </main>
      <TrustSection />
      <Footer />
    </div>
  );
}

