import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ArticlesHeroSection } from '@/components/sections/articles-hero';
import { ArticlesList } from '@/components/sections/articles-list';
import { TrustSection } from '@/components/sections/TrustSection';
import { fetchArticles } from '@/lib/articles-data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Gemology & Mine Expedition Guides | Sapphire Trails Articles',
  description: 'Authoritative guides on Ceylon Sapphires, Ratnapura gem mining history, Padparadscha valuation, safety protocols, and buying guides by Sapphire Trails.',
  alternates: {
    canonical: '/articles',
  },
  openGraph: {
    title: 'Gemology & Mine Expedition Guides | Sapphire Trails Articles',
    description: 'Expert insights, gemological buying guides, and Ratnapura expedition articles by licensed gemologists.',
    url: 'https://sapphiretrails.lk/articles',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img37.webp',
      width: 1200,
      height: 630,
      alt: 'Sapphire Trails Gemology & Expedition Articles',
    }],
  },
};

export default async function ArticlesPage() {
  const breadcrumbs = [{ label: 'Articles', href: '/articles' }];
  const initialArticles = await fetchArticles(3600);

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <Header />
      <main className="flex-1">
        {/* 1. Unified Proportional Articles Hero */}
        <ArticlesHeroSection breadcrumbs={breadcrumbs} />

        {/* 2. Featured Spotlight, Search & Filterable Articles Grid */}
        <ArticlesList initialArticles={initialArticles} />
      </main>

      {/* 3. Global Trust Strip & Footer */}
      <TrustSection />
      <Footer />
    </div>
  );
}


