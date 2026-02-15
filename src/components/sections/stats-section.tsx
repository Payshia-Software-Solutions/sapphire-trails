'use client';

import { Users, Award, ShieldCheck, Gem } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Stat {
    icon: LucideIcon;
    value: string;
    label: string;
}

const statsData: Stat[] = [
  {
    icon: Users,
    value: "5,000+",
    label: "Happy Guests"
  },
  {
    icon: Award,
    value: "27+",
    label: "Years of Hospitality Excellence"
  },
  {
    icon: ShieldCheck,
    value: "100%",
    label: "Safety Record"
  },
  {
    icon: Gem,
    value: "50+",
    label: "Active Mine Pits Accessed"
  }
];

const StatCounter = ({ stat }: { stat: Stat }) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);

    const endValue = parseInt(stat.value.replace(/[^0-9]/g, ''));
    const suffix = stat.value.replace(/[0-9,]/g, '');

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
                    requestAnimationFrame(animateCount);
                    observer.disconnect();
                }
            },
            { threshold: 0.5 } // Start when 50% of the element is visible
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
        <div ref={ref} className="flex flex-col items-center gap-2">
            <Icon className="h-10 w-10 text-primary" />
            <p className="text-4xl font-bold font-headline text-foreground">
                {count.toLocaleString()}{suffix}
            </p>
            <p className="text-sm text-muted-foreground px-2">{stat.label}</p>
        </div>
    );
};

export function StatsSection() {
  return (
    <section className="w-full py-12 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {statsData.map((stat, index) => (
                <StatCounter key={index} stat={stat} />
            ))}
          </div>
        </div>
    </section>
  );
}
