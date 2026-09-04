'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ArticlesHeroSection } from '@/components/sections/articles-hero';
import { ArticlesList } from '@/components/sections/articles-list';
import { TrustSection } from '@/components/sections/TrustSection';
import { useSiteContent, getSectionThemeClass } from '@/lib/site-content';

export default function ArticlesPage() {
  const breadcrumbs = [{ label: 'Articles', href: '/articles' }];
  const { content } = useSiteContent();
  const articles = content.articles;
  const vis = articles?.sectionVisibility || {};
  const sty = articles?.sectionStyles || {};

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <Header />
      <main className="flex-1">
        {/* 1. Unified Proportional Articles Hero */}
        {vis.hero !== false && (
          <div className={getSectionThemeClass(sty.hero)}>
            <ArticlesHeroSection breadcrumbs={breadcrumbs} />
          </div>
        )}

        {/* 2. Featured Spotlight, Search & Filterable Articles Grid */}
        {vis.list !== false && (
          <div className={getSectionThemeClass(sty.list)}>
            <ArticlesList />
          </div>
        )}
      </main>

      {/* 3. Global Trust Strip & Footer */}
      <TrustSection />
      <Footer />
    </div>
  );
}

