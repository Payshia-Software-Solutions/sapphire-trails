
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

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

export function ArticlesList() {
  return (
    <section className="w-full py-12 md:py-24 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl">
              Your Guide to the Ultimate Gem Tour
            </h1>
            <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
              Welcome to the Sapphire Trails blog, your expert resource for everything related to gem tours in Sri Lanka. Whether you're planning a gemstone tour, a gem mining tour, or simply want to learn more about the legendary Gem City of Ratnapura, our articles provide the insights you need for an unforgettable adventure.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockArticles.map((article) => (
            <Card key={article.slug} className="bg-card border-stone-800/50 flex flex-col w-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 rounded-xl overflow-hidden">
              <Link href={`/articles/${article.slug}`} className="block">
                <div className="relative h-56 w-full">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    data-ai-hint={article.imageHint}
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
                <p className="text-muted-foreground mb-6 text-sm">{article.description}</p>
                <Button asChild variant="link" className="p-0 h-auto self-start text-primary hover:text-primary/80">
                  <Link href={`/articles/${article.slug}`}>
                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
