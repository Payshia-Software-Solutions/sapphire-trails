
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ContactSection } from '@/components/sections/contact-section';
import type { Metadata } from 'next';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import { PageHero } from '@/components/shared/page-hero';
import { ContactTours } from '@/components/sections/contact-tours';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { TrustSection } from '@/components/sections/TrustSection';


export const metadata: Metadata = {
  title: 'Contact Sapphire Trails | Book Gem Mine Tours in Ratnapura, Sri Lanka',
  description: 'Get in touch with Sapphire Trails to book your exclusive gem mine tour. Located at Grand Silver Ray, Ratnapura. Call +94 71 235 7700 or message us today.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Sapphire Trails to Book a Gem Tour in Sri Lanka',
    description: 'Have questions about our Sri Lanka gem tours or gem experiences? We are here to help.',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
      width: 1200,
      height: 630,
      alt: 'A dark and moody image of the inside of a gem mine in Ratnapura.'
    }],
  }
};

const faqData = [
    {
        question: "What is Sapphire Trail Professional Gem Mining Tour?",
        answer: "The Sapphire Trails Professional Gem Mining Tour offers an extraordinary journey into the heart of Sri Lanka's legendary gem industry, wrapped in the warmth of authentic Sri Lankan hospitality. This premium travel experience seamlessly blends discovery with indulgence, offering exquisite food and beverages, luxurious accommodations, and comfortable transportation."
    },
    {
        question: "Do I need experience to participate?",
        answer: "No experience is required. Our tours are beginner-friendly and guided by knowledgeable staff who will teach you how to identify and clean your finds."
    },
    {
        question: "How long does a tour last?",
        answer: "Most tours last between 06 to 08 hours. Private or extended experiences may be available upon request."
    },
    {
        question: "Who can participate in this tour?",
        answer: "Any local or foreign tourist can participate. However, only visitors in good physical condition can enter the mine."
    },
    {
        question: "How do I make a reservation?",
        answer: "You can make a reservation through our official website www.sapphiretrails.lk. You can also reserve your spot by contacting our Hotline at 0712357700 or 0716381000, or by sending an email to info@sapphiretrails.com."
    },
]

const FaqSection = () => (
    <section className="w-full py-12 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
                 <h2 className="text-3xl font-headline font-bold text-center mb-8 text-primary">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                    {faqData.map((item, index) => (
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


export default function ContactPage() {
  const breadcrumbs = [{ label: 'Contact', href: '/contact' }];
  
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Sapphire Trails",
    "image": "https://sapphiretrails.lk/img/logo4.png",
    "@id": "https://sapphiretrails.lk",
    "url": "https://sapphiretrails.lk/contact",
    "telephone": "+94712357700",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Grand Silver Ray, Colombo - Batticaloa Hwy",
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
      "opens": "09:00",
      "closes": "18:00"
    } 
  };
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <Header />
      <main className="flex-1">
        <PageHero title="Contact Us" breadcrumbs={breadcrumbs} />
        <ContactSection />
        <FaqSection />
        <ScrollAnimate>
            <ContactTours />
        </ScrollAnimate>
      </main>
      <TrustSection />
      <Footer />
    </div>
  );
}
