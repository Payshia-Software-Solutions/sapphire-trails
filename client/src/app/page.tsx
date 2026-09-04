'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero-section';
import { JourneySection } from '@/components/sections/journey-section';
import { DiscoverSection } from '@/components/sections/discover-section';
import { ToursSection } from '@/components/sections/tours-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { StatsSection } from '@/components/sections/stats-section';
import { ExploreRatnapuraSection } from '@/components/sections/explore-ratnapura-section';
import { FAQSection } from '@/components/sections/faq-section';
import { ArticlesSection } from '@/components/sections/articles-section';
import { SubscriptionSection } from '@/components/sections/subscription-section';
import { TrustSection } from '@/components/sections/TrustSection';
import { useSiteContent, getSectionThemeClass } from '@/lib/site-content';

export default function Home() {
  const { content } = useSiteContent();
  const vis = content.homepage.sectionVisibility || {};
  const sty = content.homepage.sectionStyles || {};

  return (
    <div className="bg-background flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* 1. Hero Cinematic Video Banner */}
        {vis.hero !== false && (
          <div className={getSectionThemeClass(sty.hero)}>
            <HeroSection />
          </div>
        )}

        {/* 2. Key Heritage Numbers & Authority Stats */}
        {vis.stats !== false && (
          <div className={getSectionThemeClass(sty.stats)}>
            <StatsSection />
          </div>
        )}

        {/* 3. Signature 4-Step Expedition Journey */}
        {vis.journey !== false && (
          <div className={getSectionThemeClass(sty.journey)}>
            <JourneySection />
          </div>
        )}

        {/* 4. Authentic Photo Mosaic Gallery */}
        {vis.discover !== false && (
          <div className={getSectionThemeClass(sty.discover)}>
            <DiscoverSection />
          </div>
        )}

        {/* 5. Curated Tour Packages & Proposal Spotlight */}
        {vis.tours !== false && (
          <div className={getSectionThemeClass(sty.tours)}>
            <ToursSection />
          </div>
        )}

        {/* 6. 5-Star Social Proof & Verified Traveler Reviews */}
        {vis.reviews !== false && (
          <div className={getSectionThemeClass(sty.reviews)}>
            <TestimonialsSection />
          </div>
        )}

        {/* 7. Regional Attractions (Rainforest, Waterfalls, Safaris) */}
        {vis.explore !== false && (
          <div className={getSectionThemeClass(sty.explore)}>
            <ExploreRatnapuraSection />
          </div>
        )}

        {/* 8. Frequently Asked Questions (FAQ Accordion) */}
        {vis.faq !== false && (
          <div className={getSectionThemeClass(sty.faq)}>
            <FAQSection />
          </div>
        )}

        {/* 9. Expert Gemology & Travel Articles */}
        {vis.articles !== false && (
          <div className={getSectionThemeClass(sty.articles)}>
            <ArticlesSection />
          </div>
        )}

        {/* 10. Complimentary 2026 Gem Guide Lead Magnet */}
        {vis.guide !== false && (
          <div className={getSectionThemeClass(sty.guide)}>
            <SubscriptionSection />
          </div>
        )}
      </main>

      {/* 11. Final Trust Badges Strip & Footer */}
      {vis.trust !== false && (
        <div className={getSectionThemeClass(sty.trust)}>
          <TrustSection />
        </div>
      )}
      <Footer />
    </div>
  );
}

