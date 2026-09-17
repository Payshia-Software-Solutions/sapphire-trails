'use client';

import Image from 'next/image';
import { History } from 'lucide-react';
import { useSiteContent } from '@/lib/site-content';

export function OurStory() {
  const { content } = useSiteContent();
  const story = content.about.story;

  return (
    <section id="our-story" className="w-full py-16 md:py-24 lg:py-28 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Story & Milestones (7 cols) */}
          <div className="lg:col-span-7 space-y-6 font-sans">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1E38]/5 dark:bg-white/5 border border-[#0B1E38]/15 dark:border-white/15 text-xs font-medium uppercase tracking-[0.18em] text-[#0B1E38] dark:text-blue-200 shadow-2xs">
              <History className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300" />
              <span>{story.tagline || 'Our Heritage & Origins'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-sans font-bold tracking-tight text-foreground leading-tight">
              {story.heading}
            </h2>

            <div className="space-y-4 text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed font-normal">
              <p>{story.paragraph1}</p>
              <p>{story.paragraph2}</p>

              {story.quote && (
                <p className="p-4 rounded-xl bg-muted/40 border-l-4 border-[#0B1E38] text-foreground font-sans italic text-xs sm:text-sm md:text-base">
                  &ldquo;{story.quote}&rdquo;
                </p>
              )}
            </div>

            {/* Heritage Timeline Badges */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border/80 space-y-1 shadow-xs">
                <span className="text-xs font-bold text-[#0B1E38] dark:text-blue-300 font-mono">{story.badge1.year}</span>
                <h4 className="font-semibold text-sm text-foreground">{story.badge1.title}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{story.badge1.desc}</p>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border/80 space-y-1 shadow-xs">
                <span className="text-xs font-bold text-[#0B1E38] dark:text-blue-300 font-mono">{story.badge2.year}</span>
                <h4 className="font-semibold text-sm text-foreground">{story.badge2.title}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{story.badge2.desc}</p>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border/80 space-y-1 shadow-xs">
                <span className="text-xs font-bold text-[#0B1E38] dark:text-blue-300 font-mono">{story.badge3.year}</span>
                <h4 className="font-semibold text-sm text-foreground">{story.badge3.title}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{story.badge3.desc}</p>
              </div>
            </div>

          </div>

          {/* Right Column: Visual 3-Image Collage (5 cols) */}
          <div className="lg:col-span-5 relative space-y-4">
            <div className="relative mx-auto max-w-md lg:max-w-none space-y-4">
              
              {/* 1. Main Featured Top Image */}
              <div className="relative h-[320px] sm:h-[380px] rounded-3xl overflow-hidden border border-border/80 group">
                <Image
                  src={story.image || 'https://content-provider.payshia.com/sapphire-trail/images/tour-4-optimized.webp'}
                  alt="Washing Ceylon Sapphire Gravel in Ratnapura"
                  fill
                  className="object-cover transition-transform duration-500 ease-out md:group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-black/75 border border-white/20 text-white space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-blue-300 font-bold">
                    Mine-To-Market Integrity
                  </span>
                  <p className="text-xs text-slate-200 font-normal leading-relaxed line-clamp-2">
                    Direct access to alluvial pits and certified gem vaults with master gemologists.
                  </p>
                </div>
              </div>

              {/* 2. Two Smaller Supporting Sub-Images Underneath */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/70 group bg-muted/20">
                  <Image
                    src={story.image2 || 'https://content-provider.payshia.com/sapphire-trail/images/tour-2-optimized.webp'}
                    alt="Artisan Gem Mining Heritage"
                    fill
                    className="object-cover transition-transform duration-500 md:group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-black/10 md:group-hover:bg-transparent transition-colors" />
                </div>

                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/70 group bg-muted/20">
                  <Image
                    src={story.image3 || 'https://content-provider.payshia.com/sapphire-trail/images/tour-6-optimized.webp'}
                    alt="Precision Gem Crafting & Selection"
                    fill
                    className="object-cover transition-transform duration-500 md:group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-black/10 md:group-hover:bg-transparent transition-colors" />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
