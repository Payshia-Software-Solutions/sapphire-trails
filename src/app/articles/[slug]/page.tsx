
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PageHero } from '@/components/shared/page-hero';
import type { Metadata, ResolvingMetadata } from 'next';

// This mock data should ideally live in a central lib file.
const mockArticles = [
  {
    slug: 'guide-to-ratnapura-gems',
    title: 'The Complete Guide to Ratnapura Gems',
    description: 'Discover the variety of gemstones found in the Gem City. This article covers everything you need to know about planning your next gemstone tour and what makes this region a world-renowned destination for gem mining tour enthusiasts.',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img37.webp',
    imageHint: 'colorful gemstones',
    category: 'Gemology'
  },
  {
    slug: 'visiting-ratnapura-gem-market',
    title: 'A Pro’s Guide to the Ratnapura Gem Market',
    description: 'Planning a gem tour? No trip to Ratnapura is complete without a visit to its famous market. Learn how to navigate the bustling stalls and find the perfect souvenir from your gem mining tour with Sapphire Trails.',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp',
    imageHint: 'gemstones collection',
    category: 'Travel'
  },
  {
    slug: 'history-of-sri-lankan-gem-mining',
    title: 'The Rich History of Sri Lanka\'s Gem Mining Tour Industry',
    description: 'Explore the fascinating history of the gem mining tour industry in Sri Lanka. From ancient kings to modern-day adventurers, the quest for precious stones has shaped the culture of the Gem City.',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
    imageHint: 'gem mine cave',
    category: 'History'
  }
];

function getArticle(slug: string) {
    return mockArticles.find(article => article.slug === slug);
}


type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const article = getArticle(params.slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  const previousImages = (await parent).openGraph?.images || []

  return {
    title: `${article.title} | Sapphire Trails`,
    description: article.description,
    openGraph: {
      title: `${article.title} | Sapphire Trails`,
      description: article.description,
      images: [
        {
          url: article.imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
        ...previousImages,
      ],
    },
  }
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
    const article = getArticle(params.slug);

    if (!article) {
        notFound();
    }

    const breadcrumbs = [
        { label: 'Articles', href: '/articles' },
        { label: article.title, href: `/articles/${article.slug}` },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1">
                <PageHero title={article.title} breadcrumbs={breadcrumbs} />
                <article className="py-12 md:py-24 bg-background-alt">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="max-w-3xl mx-auto">
                            <div className="relative aspect-video mb-12 rounded-lg overflow-hidden shadow-lg">
                                <Image
                                    src={article.imageUrl}
                                    alt={article.title}
                                    data-ai-hint={article.imageHint}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                                <p className="text-xl text-foreground font-semibold">{article.description}</p>
                                <p>This is placeholder content for the article titled &quot;{article.title}&quot;. In a real application, this would be replaced with the full article body, likely fetched from a CMS. For now, we can imagine a detailed exploration of the topic, filled with useful information for anyone interested in a gem tour.</p>
                                <h2 className="text-2xl font-headline text-primary pt-4">Diving Deeper</h2>
                                <p>The content would elaborate on the key points mentioned in the description, providing valuable insights and practical tips. It would be structured with clear headings, engaging paragraphs, and perhaps even lists or blockquotes to enhance readability.</p>
                                <p>By providing in-depth content like this, Sapphire Trails can establish itself as an authority on gem tours in the Gem City of Ratnapura, attracting potential customers who are in the research phase of their travel planning. This is a key part of a successful content marketing strategy for any gemstone tour or gem mining tour operator.</p>
                            </div>
                        </div>
                    </div>
                </article>
            </main>
            <Footer />
        </div>
    );
}
