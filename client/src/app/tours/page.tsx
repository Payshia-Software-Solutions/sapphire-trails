import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Faq } from '@/components/sections/faq';
import { ToursHeroSection } from '@/components/sections/tours-hero';
import { AllToursGrid } from '@/components/sections/all-tours-grid';
import { ToursGuaranteesSection } from '@/components/sections/ToursGuaranteesSection';
import { TrustSection } from '@/components/sections/TrustSection';
import { ToursProposalCallout } from '@/components/sections/tours-proposal-callout';
import { fetchTourPackages } from '@/lib/packages-data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Luxury Gem Mine Tours in Ratnapura Sri Lanka | Sapphire Trails',
  description: 'Experience hands-on sapphire mining, alluvial gravel panning, and private gemological grading sessions in Ratnapura, Sri Lanka with Sapphire Trails.',
  alternates: {
    canonical: '/tours',
  },
  openGraph: {
    title: 'Luxury Gem Mine Tours in Ratnapura Sri Lanka | Sapphire Trails',
    description: 'Descend into authentic sapphire mines, pan traditional river gravel, and explore custom jewelry design with Sapphire Trails.',
    url: 'https://sapphiretrails.lk/tours',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img4.webp',
      width: 1200,
      height: 630,
      alt: 'Luxury Gem Mine Tours in Ratnapura Sri Lanka',
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

export default async function ToursPage() {
  const breadcrumbs = [{ label: 'Tours', href: '/tours' }];
  const initialTours = await fetchTourPackages(3600);

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <Header />
      <main className="flex-1">
        {/* 1. Proportional Luxury Tours Hero */}
        <ToursHeroSection breadcrumbs={breadcrumbs} />

        {/* 2. Featured Custom Proposal Callout Banner */}
        <ToursProposalCallout />

        {/* 3. Main Filterable Tour Grid with pre-rendered tours */}
        <AllToursGrid initialTours={initialTours} />

        {/* 4. Guarantees & Standard Inclusions Strip */}
        <ToursGuaranteesSection />

        {/* 5. Frequently Asked Questions */}
        <Faq />
      </main>

      {/* 6. Global Trust Strip & Footer */}
      <TrustSection />
      <Footer />
    </div>
  );
}



