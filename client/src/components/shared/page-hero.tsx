'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
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
    <section className="relative w-full py-12 md:py-16 lg:py-20 overflow-hidden bg-[#080E18] text-white border-b border-white/10">
      {/* Background Image with Cinematic Grading */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt={title}
          data-ai-hint="gem mine"
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
        {/* Breadcrumb Navigation - Site-wide Unified */}
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
          {/* Brand Badge */}
          {badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium uppercase tracking-[0.18em] text-blue-200 shadow-2xs">
              <span>{badge}</span>
            </div>
          )}

          {/* Main Title - Modern Poppins Sans */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-bold tracking-tight text-white leading-tight">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-normal max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
