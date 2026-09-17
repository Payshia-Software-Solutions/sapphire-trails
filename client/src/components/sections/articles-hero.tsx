'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, BookOpen, Clock, Award, Gem } from 'lucide-react';
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
    <section className="relative w-full py-12 md:py-16 lg:py-20 overflow-hidden bg-[#080E18] text-white border-b border-white/10">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#080E18] via-[#080E18]/80 to-[#080E18]/90" />
      </div>

      {/* Ambient Sapphire Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-blue-900/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="container relative z-10 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs - Site-wide consistency */}
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-400 mb-6 font-sans">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center space-x-2">
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              {pathname === crumb.href ? (
                <span className="text-white font-medium">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-white transition-colors">
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="max-w-3xl space-y-4 font-sans">
          {/* Brand Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium uppercase tracking-[0.18em] text-blue-200 shadow-2xs">
            <BookOpen className="h-3.5 w-3.5 text-blue-300" />
            <span>{articlesHero.tagline}</span>
          </div>

          {/* Main Title - Modern Poppins Sans */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-bold tracking-tight text-white leading-tight">
            {articlesHero.title}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base text-slate-300 font-normal leading-relaxed max-w-2xl">
            {articlesHero.subtitle}
          </p>

          {/* Trust Highlights */}
          <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300 font-sans">
            <span className="flex items-center gap-1.5">
              <Gem className="h-4 w-4 text-blue-300" /> Gemological Insights
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-blue-300" /> NGJA &amp; GIA Standards
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-300" /> Updated Weekly
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
