'use client';

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
import { useSiteContent, getSectionThemeClass } from '@/lib/site-content';

export default function AboutPage() {
  const { content } = useSiteContent();
  const vis = content.about.sectionVisibility || {};
  const sty = content.about.sectionStyles || {};

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-primary">
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

