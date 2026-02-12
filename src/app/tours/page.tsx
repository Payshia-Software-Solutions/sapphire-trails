
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Faq } from '@/components/sections/faq';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import { PageHero } from '@/components/shared/page-hero';
import type { Metadata } from 'next';
import { AllToursGrid } from '@/components/sections/all-tours-grid';

export const metadata: Metadata = {
  title: 'Sri Lanka Gem Tour Packages | Explore Gem Tours in Ratnapura',
  description: 'Explore exclusive gem tour packages in Ratnapura. From day trips to deluxe multi-day gem tours in Sri Lanka, discover the heart of gem country with our gem experiences.',
  openGraph: {
    title: 'Our Premier Gem Tours | Explore Sri Lankan Gem Experiences',
    description: 'Choose your perfect Sri Lankan gem adventure. We offer the best gem tour packages in Ratnapura.',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img4.webp',
      width: 1200,
      height: 630,
      alt: 'A person sifting for gems in a river on a gem tour in Ratnapura, Sri Lanka.',
    }],
  },
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What should I bring for the mine tour?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We recommend comfortable clothing, closed-toe shoes, sunscreen, a hat, and a reusable water bottle. Safety gear such as helmets will be provided. Don't forget your camera to capture the moments!"
      }
    },
    {
      "@type": "Question",
      "name": "Is the tour suitable for children?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our tours are family-friendly. However, due to the nature of the gem mines, there may be some areas with restricted access for young children. Please contact us for specific details and to discuss arrangements for your family."
      }
    }
  ]
};

export default function ToursPage() {
  const breadcrumbs = [{ label: 'Tours', href: '/tours' }];
  return (
    <div className="flex min-h-screen flex-col">
       <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <Header />
      <main className="flex-1">
        <PageHero title="Our Tours" breadcrumbs={breadcrumbs} />
        <ScrollAnimate>
          <AllToursGrid />
        </ScrollAnimate>
        <ScrollAnimate>
          <Faq />
        </ScrollAnimate>
      </main>
      <Footer />
    </div>
  );
}
