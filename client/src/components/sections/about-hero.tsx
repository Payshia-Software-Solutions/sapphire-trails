'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Sparkles, MessageSquare, Compass, ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

import { useSiteContent } from '@/lib/site-content';

interface AboutHeroSectionProps {
  breadcrumbs?: { label: string; href: string }[];
}

export function AboutHeroSection({ 
  breadcrumbs = [{ label: 'About Us', href: '/about' }] 
}: AboutHeroSectionProps) {
  const pathname = usePathname();
  const { content: siteContent } = useSiteContent();
  const aboutHero = siteContent.about.hero;

  return (
    <section className="relative w-full py-12 md:py-16 lg:py-20 overflow-hidden bg-slate-950 text-white border-b border-border/40">
      {/* Background Image with Controlled Cinematic Opacity */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://content-provider.payshia.com/sapphire-trail/images/tour-11-optimized.webp"
          alt="Ratnapura gem mining valley backdrop"
          fill
          priority
          className="object-cover object-center opacity-35 brightness-75"
        />
        {/* Soft Multi-layered Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-slate-950/75 to-slate-950/85" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Breadcrumb Navigation - Consistent with all Subpages */}
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
          {/* Subtle Brand Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-primary backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>{aboutHero.tagline}</span>
          </div>

          {/* Main Title - Consistent font-headline and font-serif accents */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tight text-white leading-tight">
            {aboutHero.title.includes(' ') ? (
              <>
                <span>{aboutHero.title.split(' ')[0]}</span>{' '}
                <span className="text-primary font-serif font-normal">{aboutHero.title.substring(aboutHero.title.indexOf(' ') + 1)}</span>
              </>
            ) : (
              aboutHero.title
            )}
          </h1>

          {/* Subtitle / Description */}
          <p className="text-sm sm:text-base md:text-lg text-slate-300 font-light leading-relaxed max-w-2xl">
            {aboutHero.subtitle}
          </p>


          {/* Quick Action Badges */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="sm"
              className="h-10 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full text-xs gap-1.5 shadow-md"
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
              className="h-10 px-5 border-white/20 bg-white/5 hover:bg-white/15 text-white font-medium rounded-full text-xs gap-1.5 backdrop-blur-sm"
            >
              <a
                href="https://wa.me/94712357700?text=Hello%2C%20I%20would%20like%20to%20know%20more%20about%20Sapphire%20Trails."
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
