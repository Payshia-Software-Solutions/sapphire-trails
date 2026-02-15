"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import useEmblaCarousel from 'embla-carousel-react';
import React from 'react';

const mockArticles = [
    {
    slug: 'complete-guide-to-gem-tour-experience',
    title: 'The Complete Guide to Your Next Gem Tour Experience',
    description: 'Discover the magic of the Gem City with Sapphire Trails. Our exclusive gem tour packages offer insight into the world of mining. Book your gemstone tour today!',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img2.webp',
    imageHint: 'gem mining',
    category: 'Guides'
  },
  {
    slug: 'guide-to-ratnapura-gems',
    title: 'The Complete Guide to Ratnapura Gems',
    description: 'Discover the variety of gemstones found in the Gem City. This article covers everything you need to know about planning your next gemstone tour.',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img37.webp',
    imageHint: 'colorful gemstones',
    category: 'Gemology'
  },
  {
    slug: 'visiting-ratnapura-gem-market',
    title: 'A Pro’s Guide to the Ratnapura Gem Market',
    description: 'Planning a gem tour? No trip to Ratnapura is complete without a visit to its famous market.',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp',
    imageHint: 'gemstones collection',
    category: 'Travel'
  }
];

const ArticleCard = ({ article }: { article: typeof mockArticles[0] }) => (
    <Card className="bg-card border-stone-800/50 flex flex-col w-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 rounded-xl overflow-hidden">
        <Link href={`/articles/${article.slug}`} className="block">
        <div className="relative h-56 w-full">
            <Image
            src={article.imageUrl}
            alt={article.title}
            data-ai-hint={article.hint}
            fill
            className="object-cover"
            />
        </div>
        </Link>
        <CardContent className="p-6 flex flex-col flex-grow">
        <p className="text-sm font-medium text-primary mb-2">{article.category}</p>
        <h3 className="text-xl font-headline font-bold text-foreground mb-4 flex-grow">
            <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>
        <Button asChild variant="link" className="p-0 h-auto self-start text-primary hover:text-primary/80">
            <Link href={`/articles/${article.slug}`}>
            Read More <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
        </CardContent>
    </Card>
);

export function ArticlesSection() {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' });

  return (
    <section id="articles" className="w-full bg-background py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <ScrollAnimate>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl">
              From Our Blog
            </h2>
            <p className="mt-4 max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed">
              Dive deeper into the world of gemology and travel with our latest articles.
            </p>
          </div>
          
          {/* Desktop view */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockArticles.slice(0, 3).map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>

          {/* Mobile view swiper */}
          <div className="md:hidden relative">
             <div className="overflow-hidden -ml-4" ref={emblaRef}>
              <div className="flex">
                {mockArticles.slice(0, 3).map((article) => (
                  <div className="relative flex-[0_0_85%] min-w-0 pl-4" key={article.slug}>
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>
            </div>
          </div>

           <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
                <Link href="/articles">View All Articles</Link>
            </Button>
          </div>
        </ScrollAnimate>
      </div>
    </section>
  );
}
