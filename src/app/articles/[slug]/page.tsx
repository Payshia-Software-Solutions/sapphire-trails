
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PageHero } from '@/components/shared/page-hero';
import type { Metadata, ResolvingMetadata } from 'next';
import { mapServerPackageToClient, type TourPackage } from '@/lib/packages-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { CalendarCheck, ArrowRight } from 'lucide-react';

const API_BASE_URL = 'https://server-sapphiretrails.payshia.com';

const newArticleContent = `
<p>Welcome to Sapphire Trails, the home of the authentic gem tour. When you book a gem tour with us, you aren't just taking a trip; you are stepping into history. A gem tour is the best way to understand the value of precious stones. Many travelers ask, "What makes a gem tour special?" The answer lies in the unique access a gem tour provides.</p>
<h2>Why Choose a Gem Tour?</h2>
<p>A gem tour offers an inside look at the industry. Unlike a standard vacation, a gem tour is educational. On our gem tour, you will visit active mines. A gem tour allows you to meet the miners. Every gem tour we organize is safe and guided. If you have never been on a gem tour, you are in for a surprise. A gem tour connects you with nature. The primary goal of a gem tour is discovery. A gem tour is perfect for families. A gem tour is also great for solo travelers.</p>
<h2>Experience the Gem City</h2>
<p>The Gem City is the heart of our operations. Your gem tour starts here. During the gem tour, you will see the famous gem markets. A gem tour in this region is world-famous. No gem tour is complete without seeing the washing process. This gem tour highlight is a favorite among guests. The gem tour guides are local experts. They make every gem tour memorable. A gem tour here supports the local community. By choosing a gem tour, you help sustain tradition.</p>
<h2>Our Gem Tour Packages</h2>
<ul>
<li><strong>The Classic Gem Tour:</strong> This gem tour covers the basics. It is our most popular gem tour.</li>
<li><strong>The Advanced Gem Tour:</strong> This gem tour is for serious collectors. The advanced gem tour includes private viewings.</li>
<li><strong>The Family Gem Tour:</strong> A gem tour designed for kids. This gem tour is safe and fun.</li>
<li><strong>The Luxury Gem Tour:</strong> Experience a gem tour in style. This gem tour includes premium transport.</li>
<li><strong>The Private Gem Tour:</strong> A custom gem tour just for you. This gem tour offers flexibility.</li>
</ul>
<h2>What to Expect on a Gem Tour</h2>
<p>When you arrive for your gem tour, you will be greeted by our team. The gem tour briefing explains safety. Every gem tour participant gets safety gear. The gem tour then moves to the mine. On the gem tour, you might find your own stone. A gem mining tour is a hands-on part of the gem tour. This gem tour activity is thrilling. The gem tour lasts for several hours. Lunch is often part of the gem tour. The gem tour ends at our showroom.</p>
<h2>Planning Your Gem Tour</h2>
<p>Booking a gem tour is easy. You can reserve your gem tour online. We recommend booking your gem tour in advance. A gem tour is a popular activity. The best time for a gem tour is the morning. Wear comfortable clothes for your gem tour. Bring a camera on your gem tour. A gem tour is a photogenic experience. Your gem tour ticket includes transport. Don't miss this gem tour opportunity.</p>
<h2>Gem Tour FAQs</h2>
<div class="space-y-4">
<div>
<h4>Is the gem tour safe?</h4>
<p>Yes, every gem tour is supervised.</p>
</div>
<div>
<h4>How long is the gem tour?</h4>
<p>A typical gem tour is 3-4 hours.</p>
</div>
<div>
<h4>Can I keep gems found on the gem tour?</h4>
<p>This depends on the specific gem tour package.</p>
</div>
<div>
<h4>Is this a gemstone tour?</h4>
<p>Yes, a gem tour focuses on gemstones.</p>
</div>
<div>
<h4>Do you offer a Sapphire Trails gem tour?</h4>
<p>Yes, that is our signature gem tour.</p>
</div>
</div>
<h2>Conclusion</h2>
<p>Thank you for choosing Sapphire Trails for your gem tour. We hope this gem tour guide has been helpful. We look forward to hosting your gem tour soon. Remember, a gem tour is a memory that lasts a lifetime. Book your gem tour today!</p>
`;

// This mock data should ideally live in a central lib file.
const mockArticles = [
  {
    slug: 'complete-guide-to-gem-tour-experience',
    title: 'The Complete Guide to Your Next Gem Tour Experience',
    description: 'Discover the magic of the Gem City with Sapphire Trails. Our exclusive gem tour packages offer insight into the world of mining. Book your gemstone tour today!',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img2.webp',
    imageHint: 'gem mining',
    category: 'Guides',
    content: newArticleContent,
  },
  {
    slug: 'guide-to-ratnapura-gems',
    title: 'The Complete Guide to Ratnapura Gems',
    description: 'Discover the variety of gemstones found in the Gem City. This article covers everything you need to know about planning your next gemstone tour and what makes this region a world-renowned destination for gem mining tour enthusiasts.',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img37.webp',
    imageHint: 'colorful gemstones',
    category: 'Gemology',
    content: null,
  },
  {
    slug: 'visiting-ratnapura-gem-market',
    title: 'A Pro’s Guide to the Ratnapura Gem Market',
    description: 'Planning a gem tour? No trip to Ratnapura is complete without a visit to its famous market. Learn how to navigate the bustling stalls and find the perfect souvenir from your gem mining tour with Sapphire Trails.',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp',
    imageHint: 'gemstones collection',
    category: 'Travel',
    content: null,
  },
  {
    slug: 'history-of-sri-lankan-gem-mining',
    title: 'The Rich History of Sri Lanka\'s Gem Mining Tour Industry',
    description: 'Explore the fascinating history of the gem mining tour industry in Sri Lanka. From ancient kings to modern-day adventurers, the quest for precious stones has shaped the culture of the Gem City.',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
    imageHint: 'gem mine cave',
    category: 'History',
    content: null,
  }
];

function getArticle(slug: string) {
    return mockArticles.find(article => article.slug === slug);
}

async function getTours(): Promise<TourPackage[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/tours`);
        if (!response.ok) {
            console.error('Failed to fetch tours from server.');
            return [];
        }

        const data = await response.json();
        if (Array.isArray(data)) {
            return data.map(mapServerPackageToClient);
        }
        return [];
    } catch (e) {
        console.error("Failed to fetch or parse packages.", e);
        return [];
    }
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
  
  const metadata: Metadata = {
    title: `${article.title} | Sapphire Trails`,
    description: article.description,
  }

  if (article.slug === 'complete-guide-to-gem-tour-experience') {
    metadata.title = 'Sapphire Trails: The Ultimate Gem Tour & Mining Adventure';
    metadata.description = 'Discover the magic of the Gem City with Sapphire Trails. Our exclusive gem tour packages offer insight into the world of mining. Book your gemstone tour today!';
  }

  metadata.openGraph = {
      title: metadata.title,
      description: metadata.description,
      images: [
        {
          url: article.imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
        ...previousImages,
      ],
    }

  return metadata;
}

const TourCard = ({ tour }: { tour: TourPackage }) => (
    <Card className="bg-card border-stone-800/50 flex flex-col w-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 rounded-xl overflow-hidden">
      <Link href={`/tours/${tour.slug}`} className="block group">
          <div className="relative h-40 w-full">
          <Image
              src={tour.imageUrl}
              alt={tour.imageAlt}
              data-ai-hint={tour.imageHint}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          </div>
      </Link>
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-headline font-bold text-primary mb-2 flex-grow">
          <Link href={`/tours/${tour.slug}`}>{tour.homepageTitle}</Link>
        </h3>
        <div className="flex items-center justify-between gap-4 mt-auto">
          <p className="text-lg font-bold text-primary">{tour.price}</p>
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4">
            <Link href={`/booking?tourType=${tour.id}`}>
              <CalendarCheck className="mr-2 h-4 w-4" />
              Book
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

function ToursSidebar({ tours }: { tours: TourPackage[] }) {
    if (!tours || tours.length === 0) return null;
    return (
        <div>
            <div className="text-left">
                <h2 className="text-2xl font-headline font-bold tracking-tight text-primary">
                    Ready for an Adventure?
                </h2>
                <p className="mt-2 text-muted-foreground">
                    Choose your perfect gem tour experience and book now.
                </p>
            </div>
            <div className="space-y-6 mt-6">
                {tours.map((tour) => (
                    <TourCard key={tour.id} tour={tour} />
                ))}
            </div>
        </div>
    )
}

function MoreArticles({ currentArticleSlug }: { currentArticleSlug: string }) {
    const otherArticles = mockArticles.filter(article => article.slug !== currentArticleSlug).slice(0, 3);

    if (otherArticles.length === 0) return null;

    return (
        <div>
            <h2 className="text-2xl font-headline font-bold tracking-tight text-primary mb-6">
                More Articles
            </h2>
            <div className="space-y-6">
                {otherArticles.map(article => (
                    <Link key={article.slug} href={`/articles/${article.slug}`} className="group flex items-center gap-4">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                            <Image
                                src={article.imageUrl}
                                alt={article.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{article.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{article.category}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
    const article = getArticle(params.slug);
    const tours = await getTours();

    if (!article) {
        notFound();
    }
    
    const pageTitle = article.slug === 'complete-guide-to-gem-tour-experience'
        ? 'The Complete Guide to Your Next Gem Tour Experience'
        : article.title;

    const breadcrumbs = [
        { label: 'Articles', href: '/articles' },
        { label: article.title, href: `/articles/${article.slug}` },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1">
                <PageHero title={pageTitle} breadcrumbs={breadcrumbs} />
                <div className="py-12 md:py-24 bg-background-alt">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-12 lg:gap-16">
                            <article className="lg:col-span-2 xl:col-span-3 space-y-12">
                                <div className="max-w-4xl">
                                    <div className="relative aspect-video mb-12 rounded-lg overflow-hidden shadow-lg">
                                        <Image
                                            src={article.imageUrl}
                                            alt={article.title}
                                            data-ai-hint={article.imageHint}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    {article.content ? (
                                        <div
                                          className="prose prose-invert prose-lg max-w-none [&_h2]:text-2xl [&_h2]:font-headline [&_h2]:text-primary [&_h2]:pt-4 [&_h4]:font-semibold [&_h4]:text-foreground [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-2"
                                          dangerouslySetInnerHTML={{ __html: article.content }}
                                        />
                                    ) : (
                                        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                                            <p className="text-xl text-foreground font-semibold">{article.description}</p>
                                            <p>This is placeholder content for the article titled &quot;{article.title}&quot;. In a real application, this would be replaced with the full article body, likely fetched from a CMS. For now, we can imagine a detailed exploration of the topic, filled with useful information for anyone interested in a gem tour.</p>
                                            <h2 className="text-2xl font-headline text-primary pt-4">Diving Deeper</h2>
                                            <p>The content would elaborate on the key points mentioned in the description, providing valuable insights and practical tips. It would be structured with clear headings, engaging paragraphs, and perhaps even lists or blockquotes to enhance readability.</p>
                                            <p>By providing in-depth content like this, Sapphire Trails can establish itself as an authority on gem tours in the Gem City of Ratnapura, attracting potential customers who are in the research phase of their travel planning. This is a key part of a successful content marketing strategy for any gemstone tour or gem mining tour operator.</p>
                                        </div>
                                    )}
                                </div>
                            </article>
                            <div className="lg:col-span-1 xl:col-span-1">
                                <div className="sticky top-24 space-y-12">
                                    <ToursSidebar tours={tours} />
                                    <MoreArticles currentArticleSlug={params.slug} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
