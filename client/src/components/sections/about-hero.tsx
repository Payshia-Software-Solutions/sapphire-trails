'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, MessageSquare, Compass, ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

import { useSiteContent, getWhatsappUrl } from '@/lib/site-content';

interface AboutHeroSectionProps {
  breadcrumbs?: { label: string; href: string }[];
}

export function AboutHeroSection({ 
  breadcrumbs = [{ label: 'About Us', href: '/about' }] 
}: AboutHeroSectionProps) {
  const pathname = usePathname();
  const { content } = useSiteContent();
  const aboutHero = content.about.hero;

  return (
    <section className="relative w-full py-12 md:py-16 lg:py-20 overflow-hidden bg-[#080E18] text-white border-b border-white/10">
      {/* Background Image with Controlled Cinematic Opacity */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://content-provider.payshia.com/sapphire-trail/images/tour-11-optimized.webp"
          alt="Ratnapura gem mining valley backdrop"
          fill
          priority
          className="object-cover object-center opacity-30 brightness-75"
        />
        {/* Soft Multi-layered Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080E18] via-[#080E18]/80 to-[#080E18]/90" />
      </div>

      {/* Ambient Sapphire Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-blue-900/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="container relative z-10 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation - Consistent with all Subpages */}
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
          {/* Subtle Brand Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium uppercase tracking-[0.18em] text-blue-200 shadow-2xs">
            <span>{aboutHero.tagline}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-bold tracking-tight text-white leading-tight">
            {aboutHero.title}
          </h1>

          {/* Subtitle / Description */}
          <p className="text-xs sm:text-sm md:text-base text-slate-300 font-normal leading-relaxed max-w-2xl">
            {aboutHero.subtitle}
          </p>

          {/* Quick Action Badges */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="sm"
              className="h-10 px-6 bg-white hover:bg-slate-100 text-[#080E18] font-semibold rounded-full text-xs gap-1.5 shadow-md transition-all"
            >
              <Link href="#our-story">
                <Compass className="h-3.5 w-3.5" />
                <span>Our Heritage &amp; Story</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-10 px-6 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium rounded-full text-xs gap-1.5 transition-colors"
            >
              <a
                href={getWhatsappUrl(content, 'Hello, I would like to know more about Sapphire Trails.')}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                <span>WhatsApp Concierge</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
