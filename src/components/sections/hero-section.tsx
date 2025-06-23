"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} width="128" height="106" viewBox="0 0 128 106" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth="1">
        <path d="M64 105.5L0.5 38L64 0.5L127.5 38L64 105.5Z" stroke="currentColor"/>
        <path d="M0.5 38H127.5" stroke="currentColor"/>
        <path d="M32 38L64 71L96 38" stroke="currentColor"/>
        <path d="M64 105.5V0.5" stroke="currentColor"/>
        <path d="M48 38C52.6667 30.1667 71.8 28.6 80 38" stroke="currentColor"/>
        <path d="M56 38C59.3333 32.5 68.2 31.4 72 38" stroke="currentColor"/>
    </svg>
);


export function HeroSection() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center">
      <Image
        src="https://images.unsplash.com/photo-1550450009-3b80827e8817?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxN3x8Z2VtJTIwdHJhaWwlMjB1bmRlcmdyb3VuZHxlbnwwfHx8fDE3NTA3MDQ5OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
        alt="A dark and moody image of the inside of a gem mine, with rock walls and dim lighting."
        data-ai-hint="gem mine cave"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />
      <div className="absolute inset-0 bg-black/70 z-10" />
      <div className="relative z-20 flex flex-col items-center justify-center text-center text-foreground p-4 space-y-8">
        
        <div className="flex flex-col items-center space-y-4">
            <LogoIcon className="w-24 h-24" />
            <p className="font-headline text-2xl tracking-[0.3em]">SAPPHIRE TRAILS</p>
            <p className="text-xs tracking-[0.4em] text-muted-foreground">PROFESSIONAL GEM TOURS</p>
        </div>

        <div className="space-y-4 max-w-4xl">
            <h1 className="text-5xl font-headline font-bold tracking-tight sm:text-6xl md:text-7xl">
                Sri Lanka's Only Luxury Gem Experience
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 font-body">
                Experience luxury, culture, and adventure
            </p>
        </div>

        <Button asChild size="lg">
          <Link href="#booking">Book Now</Link>
        </Button>
      </div>
    </section>
  );
}
