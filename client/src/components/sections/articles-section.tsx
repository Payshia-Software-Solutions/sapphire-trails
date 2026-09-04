"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Clock, CalendarDays, Sparkles } from 'lucide-react';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import useEmblaCarousel from 'embla-carousel-react';
import React from 'react';
import { useSiteContent } from '@/lib/site-content';


const mockArticles = [
  {
    slug: 'complete-guide-to-gem-tour-experience',
    title: 'The Complete Guide to Descending into an Active Ceylon Gem Mine',
    description: 'Everything you need to know before visiting Ratnapura—from underground safety harnesses to the traditional illam washing rituals in mountain streams.',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img2.webp',
    imageHint: 'gem mining pit experience',
    category: 'Expedition Guide',
    readTime: '5 min read',
    date: 'February 2026'
  },
  {
    slug: 'guide-to-ratnapura-gems',
    title: 'Ceylon Sapphires 101: Identifying Royal Blue, Padparadscha & Star Stones',
    description: 'A gemologist guide to understanding heat treatments, crystal clarity, and what makes Sri Lankan corundum the most sought-after in global auction houses.',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img37.webp',
    imageHint: 'colorful gemstones array',
    category: 'Gemology & Valuation',
    readTime: '7 min read',
    date: 'January 2026'
  },
  {
    slug: 'visiting-ratnapura-gem-market',
    title: 'Secrets of the Ratnapura Street Gem Market: A Buyer’s Insider Protocol',
    description: 'How rough sapphires change hands in the morning street bazaar, optical torch inspection techniques, and how our guests safely observe the trade.',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp',
    imageHint: 'gemstones street trade',
    category: 'Market Insights',
    readTime: '4 min read',
    date: 'January 2026'
  }
];

const ArticleCard = ({ article }: { article: typeof mockArticles[0] }) => (
  <Card className="bg-card border border-border/80 flex flex-col w-full transform transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 rounded-2xl overflow-hidden group">
    {/* Article Thumbnail */}
    <Link href={`/articles/${article.slug}`} className="block relative h-60 w-full overflow-hidden">
      <Image
        src={article.imageUrl}
        alt={article.title}
        data-ai-hint={article.imageHint}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
      
      {/* Category Pill */}
      <div className="absolute top-3.5 left-3.5 bg-black/65 border border-primary/40 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-primary uppercase tracking-wider">
        {article.category}
      </div>

      {/* Read Time & Date */}
      <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-[11px] text-white/90 font-medium">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-primary" />
          {article.readTime}
        </span>
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3 w-3 text-primary" />
          {article.date}
        </span>
      </div>
    </Link>

    {/* Card Content */}
    <CardContent className="p-6 sm:p-7 flex flex-col flex-grow justify-between space-y-4">
      <div className="space-y-2.5">
        <h3 className="text-lg sm:text-xl font-headline font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
          <Link href={`/articles/${article.slug}`}>
            {article.title}
          </Link>
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {article.description}
        </p>
      </div>

      {/* Read More Link */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between">
        <Link 
          href={`/articles/${article.slug}`}
          className="inline-flex items-center text-xs font-semibold text-primary hover:text-primary/80 transition-colors group-hover:translate-x-0.5 duration-200"
        >
          <span>Read Full Article</span>
          <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </CardContent>
  </Card>
);

export function ArticlesSection() {
  const { content } = useSiteContent();
  const articlesHeader = content.homepage.articlesHeader;
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' });

  return (
    <section id="articles" className="w-full bg-background py-16 md:py-28 relative">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <ScrollAnimate>
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14 md:mb-18">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold uppercase tracking-wider text-primary">
              <BookOpen className="h-3.5 w-3.5" />
              {articlesHeader.tagline || 'Field Journal & Gemology Insights'}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary">
              {articlesHeader.heading || 'Stories from the Mines'}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
              {articlesHeader.subtitle}
            </p>
          </div>

          
          {/* Desktop View (3-Column Grid) */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {mockArticles.slice(0, 3).map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>

          {/* Mobile View Swiper */}
          <div className="md:hidden relative">
            <div className="overflow-hidden -ml-4" ref={emblaRef}>
              <div className="flex">
                {mockArticles.slice(0, 3).map((article) => (
                  <div className="relative flex-[0_0_88%] min-w-0 pl-4" key={article.slug}>
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="text-center mt-12 md:mt-16">
            <Button asChild size="lg" variant="outline" className="rounded-full border-primary/40 text-foreground hover:bg-primary/10 hover:text-primary px-8 h-11 text-xs font-semibold">
              <Link href="/articles">
                Explore All Journal Articles
                <ArrowRight className="ml-2 h-4 w-4 text-primary" />
              </Link>
            </Button>
          </div>

        </ScrollAnimate>
      </div>
    </section>
  );
}
