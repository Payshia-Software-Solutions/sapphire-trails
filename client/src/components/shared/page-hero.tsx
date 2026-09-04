'use client';

import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface Breadcrumb {
  label: string;
  href: string;
}

interface PageHeroProps {
  title: string;
  breadcrumbs: Breadcrumb[];
  badge?: string;
  subtitle?: string;
  backgroundImage?: string;
}

export function PageHero({ 
  title, 
  breadcrumbs, 
  badge,
  subtitle,
  backgroundImage = 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp'
}: PageHeroProps) {
  const pathname = usePathname();

  return (
    <section className="relative w-full py-12 md:py-16 lg:py-20 overflow-hidden bg-slate-950 text-white border-b border-border/40">
      {/* Background Image with Cinematic Grading */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt={title}
          data-ai-hint="gem mine"
          fill
          priority
          className="object-cover object-center opacity-35 brightness-75"
        />
        {/* Soft Multi-layered Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-slate-950/75 to-slate-950/85" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Breadcrumb Navigation - Site-wide Unified */}
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
          {/* Optional Brand Badge */}
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-primary backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>{badge}</span>
            </div>
          )}

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tight text-white leading-tight">
            {title.includes(' & ') ? (
              <>
                <span>{title.split(' & ')[0]}</span>{' '}
                <span className="text-primary font-serif font-normal">&amp; {title.split(' & ')[1]}</span>
              </>
            ) : (
              title
            )}
          </h1>

          {/* Optional Subtitle */}
          {subtitle && (
            <p className="text-sm sm:text-base md:text-lg text-slate-300 font-light leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
