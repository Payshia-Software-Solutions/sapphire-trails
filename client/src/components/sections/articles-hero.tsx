'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Sparkles, BookOpen, Clock, Award, Gem } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { useSiteContent } from '@/lib/site-content';

interface ArticlesHeroProps {
  breadcrumbs?: { label: string; href: string }[];
}

export function ArticlesHeroSection({ 
  breadcrumbs = [{ label: 'Articles', href: '/articles' }] 
}: ArticlesHeroProps) {
  const pathname = usePathname();
  const { content: siteContent } = useSiteContent();
  const articlesHero = siteContent.articles.hero;

  return (
    <section className="relative w-full py-12 md:py-16 lg:py-20 overflow-hidden bg-slate-950 text-white border-b border-border/40">
      {/* Background Image with Cinematic Grading */}
      <div className="absolute inset-0 z-0">
        <Image
          src={articlesHero.image || "https://content-provider.payshia.com/sapphire-trail/images/img33.webp"}
          alt="Lustrous natural Ceylon sapphires collection"
          fill
          priority
          className="object-cover object-center opacity-30 brightness-75"
        />

        {/* Soft Multi-layered Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-slate-950/75 to-slate-950/85" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Breadcrumbs - Site-wide consistency */}
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-400 mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center space-x-2">
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              {pathname === crumb.href ? (
                <span className="text-primary font-medium">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-primary transition-colors">
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="max-w-3xl space-y-4">
          {/* Brand Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-primary backdrop-blur-md">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span>{articlesHero.tagline}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tight text-white leading-tight">
            {articlesHero.title.includes(' ') ? (
              <>
                <span>{articlesHero.title.split(' ')[0]}</span>{' '}
                <span className="text-primary font-serif font-normal">{articlesHero.title.substring(articlesHero.title.indexOf(' ') + 1)}</span>
              </>
            ) : (
              articlesHero.title
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-300 font-light leading-relaxed max-w-2xl">
            {articlesHero.subtitle}
          </p>

          {/* Trust Highlights */}
          <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Gem className="h-4 w-4 text-primary" /> Gemological Insights
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary" /> NGJA &amp; GIA Standards
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" /> Updated Weekly
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
