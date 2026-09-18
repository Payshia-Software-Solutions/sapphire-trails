import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AboutHeroSection } from '@/components/sections/about-hero';
import { AboutMetricsSection } from '@/components/sections/AboutMetricsSection';
import { OurStory } from '@/components/sections/our-story';
import { ExperienceSection } from '@/components/sections/experience-section';
import { AboutCoreValues } from '@/components/sections/AboutCoreValues';
import { AboutGemJourney } from '@/components/sections/AboutGemJourney';
import { WhyRatnapuraSection } from '@/components/sections/WhyRatnapuraSection';
import { AboutTrustStrip } from '@/components/sections/AboutTrustStrip';
import { AboutCtaSection } from '@/components/sections/AboutCtaSection';
import { TrustSection } from '@/components/sections/TrustSection';
import { fetchSiteContentServer, getSectionThemeClass } from '@/lib/site-content';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'About Us | Sapphire Trails Sri Lanka - Ethical Gem Mining & Heritage Tours',
  description: "Learn about Sapphire Trails, Sri Lanka's premier ethical gem mining and gemological expedition operator in Ratnapura. Over 40 years of artisanal gem heritage.",
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Sapphire Trails | Ethical Gem Mining & Heritage Tours in Sri Lanka',
    description: 'Discover the story, ethical mining values, and master craftsmanship behind Sapphire Trails in Ratnapura, Sri Lanka.',
    url: 'https://sapphiretrails.lk/about',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/tour-11-optimized.webp',
      width: 1200,
      height: 630,
      alt: 'Sapphire Trails Ethical Gem Mining in Ratnapura',
    }],
  },
};

export default async function AboutPage() {
  const content = await fetchSiteContentServer();
  const vis = content.about.sectionVisibility || {};
  const sty = content.about.sectionStyles || {};

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Sapphire Trails",
    "description": "Learn about Sapphire Trails, Sri Lanka's premier ethical gem mining and gemological expedition operator in Ratnapura.",
    "url": "https://sapphiretrails.lk/about",
    "publisher": {
      "@type": "Organization",
      "name": "Sapphire Trails",
      "url": "https://sapphiretrails.lk",
      "logo": "https://sapphiretrails.lk/img/logo4.png"
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <Header />
      <main className="flex-1">
        {/* 1. Cinematic Luxury Hero */}
        {vis.hero !== false && (
          <div className={getSectionThemeClass(sty.hero)}>
            <AboutHeroSection />
          </div>
        )}

        {/* 2. Key Impact Metrics & Heritage Counters */}
        {vis.metrics !== false && (
          <div className={getSectionThemeClass(sty.metrics)}>
            <AboutMetricsSection />
          </div>
        )}

        {/* 3. Deep Heritage & Our Story */}
        {vis.story !== false && (
          <div className={getSectionThemeClass(sty.story)}>
            <OurStory />
          </div>
        )}

        {/* 4. The Sapphire Trails Multi-Faceted Experience */}
        {vis.experience !== false && (
          <div className={getSectionThemeClass(sty.experience)}>
            <ExperienceSection />
          </div>
        )}

        {/* 5. Core Values: Ethical Mining, Ecology, Safety, Authenticity */}
        {vis.values !== false && (
          <div className={getSectionThemeClass(sty.values)}>
            <AboutCoreValues />
          </div>
        )}

        {/* 6. From Mine to Masterpiece: The 4-Stage Sapphire Journey */}
        {vis.journey !== false && (
          <div className={getSectionThemeClass(sty.journey)}>
            <AboutGemJourney />
          </div>
        )}

        {/* 7. Why Ratnapura: Royal Lore & Geological Heritage */}
        {vis.whyRatnapura !== false && (
          <div className={getSectionThemeClass(sty.whyRatnapura)}>
            <WhyRatnapuraSection />
          </div>
        )}

        {/* 8. Official Accreditations & Government Compliance */}
        {vis.trustStrip !== false && (
          <div className={getSectionThemeClass(sty.trustStrip)}>
            <AboutTrustStrip />
          </div>
        )}

        {/* 9. High-Converting Executive CTA with WhatsApp Concierge */}
        {vis.cta !== false && (
          <div className={getSectionThemeClass(sty.cta)}>
            <AboutCtaSection />
          </div>
        )}
      </main>

      {/* 10. Global Trust Section & Footer */}
      <TrustSection />
      <Footer />
    </div>
  );
}

