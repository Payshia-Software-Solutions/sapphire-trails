
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PageHero } from '@/components/shared/page-hero';
import type { Metadata } from 'next';
import { ArticlesList } from '@/components/sections/articles-list';
import { TrustSection } from '@/components/sections/TrustSection';

export const metadata: Metadata = {
  title: 'Gem Tour Articles | Sapphire Trails',
  description: 'Explore articles about gem tours, gemstone tours, and gem mining tours in the Gem City, Ratnapura. Your expert guide from Sapphire Trails.',
  alternates: {
    canonical: '/articles',
  },
  openGraph: {
    title: 'Gem Tour Articles | Sapphire Trails',
    description: 'Explore articles about gem tours, gemstone tours, and gem mining tours in the Gem City, Ratnapura.',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp',
      width: 1200,
      height: 630,
      alt: 'A collection of colorful polished gemstones from a Ratnapura gem tour.'
    }],
  }
};

export default function ArticlesPage() {
  const breadcrumbs = [{ label: 'Articles', href: '/articles' }];
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <PageHero title="Articles & Insights" breadcrumbs={breadcrumbs} />
        <ArticlesList />
      </main>
      <TrustSection />
      <Footer />
    </div>
  );
}
