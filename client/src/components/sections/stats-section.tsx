'use client';

import { Users, Award, ShieldCheck, Gem } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useSiteContent } from '@/lib/site-content';

interface Stat {
    icon: LucideIcon;
    value: string;
    label: string;
}

const defaultIcons = [Users, Award, ShieldCheck, Gem];

const StatCounter = ({ stat }: { stat: Stat }) => {
    const endValue = parseInt(stat.value.replace(/[^0-9]/g, '')) || 0;
    const suffix = stat.value.replace(/[0-9,]/g, '');

    // Default to the full real value so SSR, Googlebot, and SEO crawlers index the real numbers, never 0
    const [count, setCount] = useState<number>(endValue);
    const hasAnimated = useRef(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    const duration = 2000; // 2 seconds
                    const startTime = performance.now();

                    const animateCount = (currentTime: number) => {
                        const elapsedTime = currentTime - startTime;
                        const progress = Math.min(elapsedTime / duration, 1);
                        const currentCount = Math.floor(progress * endValue);
                        
                        setCount(currentCount);

                        if (progress < 1) {
                            requestAnimationFrame(animateCount);
                        } else {
                            setCount(endValue);
                        }
                    };

                    // Reset to 0 and run the visual count-up animation for human visitors
                    setCount(0);
                    requestAnimationFrame(animateCount);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [endValue]);

    const Icon = stat.icon;
    return (
        <div ref={ref} className="flex flex-col items-center gap-1 sm:gap-1.5 px-1 sm:px-2">
            <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-[#0B1E38] dark:text-blue-300 shrink-0" aria-hidden="true" />
            <p className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-sans font-bold text-foreground tracking-tight">
                {/* Search engine crawlers and screen readers always get the verified stat value */}
                <span className="sr-only">{stat.value}</span>
                <span aria-hidden="true">{count.toLocaleString()}{suffix}</span>
            </p>
            <p className="text-xs sm:text-[13px] text-muted-foreground font-sans max-w-[170px] mx-auto leading-snug font-normal">
                {stat.label}
            </p>
        </div>
    );
};

export function StatsSection() {
  const { content } = useSiteContent();
  const statsList = content.homepage.stats || [];

  return (
    <section className="w-full py-6 sm:py-7 md:py-9 bg-card/40 dark:bg-card/20 border-y border-border/50">
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-4 sm:gap-6 md:gap-8 text-center">
            {statsList.map((stat, index) => (
                <StatCounter 
                  key={index} 
                  stat={{
                    icon: defaultIcons[index % defaultIcons.length],
                    value: stat.value,
                    label: stat.label
                  }} 
                />
            ))}
          </div>
        </div>
    </section>
  );
}
