'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  BookOpen, 
  Clock, 
  CalendarDays, 
  Sparkles, 
  Search, 
  Filter, 
  Gem,
  Tag
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { type ArticleItem, getStoredArticles } from '@/lib/articles-data';
import { useSiteContent } from '@/lib/site-content';

export function ArticlesList() {
  const { content } = useSiteContent();
  const listHeader = content.articles?.listHeader || {
    tagline: 'Field Journal & Guides',
    heading: 'Explore Articles & Insights'
  };

  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    setArticles(getStoredArticles());
  }, []);

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(articles.map((a) => a.category)))];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchesSearch =
        searchQuery === '' ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, selectedCategory]);

  const featuredArticle = filteredArticles.length > 0 && selectedCategory === 'all' && searchQuery === '' 
    ? filteredArticles[0] 
    : null;

  const remainingArticles = featuredArticle 
    ? filteredArticles.slice(1) 
    : filteredArticles;

  return (
    <section className="w-full py-12 md:py-20 bg-background relative">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        
        {/* Search & Category Filter Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-8 mb-8 border-b border-border/80">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary font-serif">
              {listHeader.tagline}
            </span>
            <h2 className="text-2xl sm:text-3xl font-headline font-bold text-foreground">
              {listHeader.heading}
            </h2>
          </div>


          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guides, sapphires &amp; lore..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-xs h-10 bg-card border-border/80 rounded-full shadow-2xs focus-visible:ring-primary/40"
            />
          </div>
        </div>

        {/* Clean Category Filter Pills (No Scrollbar Artifacts) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => {
            const count = cat === 'all' 
              ? articles.length 
              : articles.filter((a) => a.category === cat).length;
            const isSelected = selectedCategory === cat;

            return (
              <Button
                key={cat}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs h-8 px-4 rounded-full capitalize whitespace-nowrap gap-1.5 transition-all shadow-2xs ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm' 
                    : 'bg-card border-border/80 text-muted-foreground hover:text-foreground hover:border-primary/40'
                }`}
              >
                <span>{cat === 'all' ? 'All Guides' : cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-black/20 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {count}
                </span>
              </Button>
            );
          })}
        </div>

        {/* 1. Featured Spotlight Article (when viewing all) */}
        {featuredArticle && (
          <div className="mb-12">
            <Card className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:border-primary/50 transition-all duration-300 group cursor-pointer">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
                {/* Featured Thumbnail */}
                <Link href={`/articles/${featuredArticle.slug}`} className="block lg:col-span-7 relative min-h-[280px] sm:min-h-[360px] w-full overflow-hidden">
                  <Image
                    src={featuredArticle.imageUrl}
                    alt={featuredArticle.title}
                    data-ai-hint={featuredArticle.imageHint}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent lg:hidden" />
                  
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider px-3 py-1 shadow-md">
                      Featured Spotlight
                    </Badge>
                  </div>
                </Link>

                {/* Featured Content */}
                <div className="lg:col-span-5 p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-semibold text-primary uppercase tracking-wider text-[11px]">
                        {featuredArticle.category}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {featuredArticle.readTime}
                      </span>
                    </div>

                    <Link href={`/articles/${featuredArticle.slug}`} className="block">
                      <h3 className="text-2xl sm:text-3xl font-headline font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {featuredArticle.title}
                      </h3>
                    </Link>

                    <Link href={`/articles/${featuredArticle.slug}`} className="block">
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light line-clamp-4">
                        {featuredArticle.description}
                      </p>
                    </Link>
                  </div>

                  <div className="pt-4 border-t border-border/80 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-primary" />
                      {featuredArticle.publishedDate}
                    </span>

                    <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-full px-5 gap-1.5 shadow-sm">
                      <Link href={`/articles/${featuredArticle.slug}`}>
                        <span>Read Full Guide</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 2. Remaining Articles Grid */}
        {remainingArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {remainingArticles.map((article) => (
              <Card
                key={article.slug}
                className="bg-card border border-border/80 flex flex-col w-full rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-primary/50 transition-all duration-300 group cursor-pointer"
              >
                {/* Article Thumbnail - Clickable */}
                <Link href={`/articles/${article.slug}`} className="block relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    data-ai-hint={article.imageHint}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 bg-slate-950/85 border border-primary/30 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider z-10">
                    {article.category}
                  </div>

                  {/* Read Time & Date Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-200 font-medium z-10">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary" />
                      {article.readTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3 text-primary" />
                      {article.publishedDate}
                    </span>
                  </div>
                </Link>

                {/* Card Content */}
                <CardContent className="p-6 flex flex-col flex-grow justify-between space-y-4">
                  <div className="space-y-2.5">
                    <Link href={`/articles/${article.slug}`} className="block">
                      <h3 className="text-lg sm:text-xl font-headline font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h3>
                    </Link>
                    <Link href={`/articles/${article.slug}`} className="block">
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed font-light">
                        {article.description}
                      </p>
                    </Link>
                  </div>

                  {/* Read More Link */}
                  <div className="pt-3 border-t border-border/80 flex items-center justify-between">
                    <Link
                      href={`/articles/${article.slug}`}
                      className="inline-flex items-center text-xs font-semibold text-primary hover:text-primary/80 transition-colors group-hover:translate-x-1 duration-200"
                    >
                      <span>Read Full Guide</span>
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !featuredArticle && (
          <div className="text-center text-muted-foreground py-20 flex flex-col items-center gap-4">
            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-base font-semibold text-foreground">No articles match your search or filter.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}

      </div>
    </section>
  );
}
