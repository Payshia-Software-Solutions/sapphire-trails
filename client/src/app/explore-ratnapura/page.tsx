
'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ExploreRatnapuraContent } from '@/components/sections/explore-ratnapura-content';
import { PageHero } from '@/components/shared/page-hero';
import { TrustSection } from '@/components/sections/TrustSection';
import { useSiteContent, getSectionThemeClass } from '@/lib/site-content';

export default function ExploreRatnapuraPage() {
  const breadcrumbs = [{ label: 'Explore Ratnapura', href: '/explore-ratnapura' }];
  const { content } = useSiteContent();
  const explore = content.explore;
  const vis = explore?.sectionVisibility || {};
  const sty = explore?.sectionStyles || {};

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <Header />
      <main className="flex-1">
        {/* 1. Hero Banner */}
        {vis.hero !== false && (
          <div className={getSectionThemeClass(sty.hero)}>
            <PageHero 
              title={explore?.hero?.title || 'Explore Ratnapura'} 
              badge={explore?.hero?.tagline || 'City of Gems Discovery Guide'}
              subtitle={explore?.hero?.subtitle || 'Discover ancient sapphire trading markets, revered temples, cascading waterfalls, and lush tea estates in the Sabaragamuwa province.'}
              breadcrumbs={breadcrumbs} 
              backgroundImage={explore?.hero?.image || 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp'}
            />
          </div>
        )}

        {/* 2. Attractions Catalog Grid */}
        {vis.catalog !== false && (
          <div className={getSectionThemeClass(sty.catalog, 'bg-background-alt')}>
            <ExploreRatnapuraContent />
          </div>
        )}
      </main>
      <TrustSection />
      <Footer />
    </div>
  );
}

