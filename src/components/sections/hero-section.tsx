"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center">
      <Image
        src="https://content-provider.payshia.com/sapphire-trail/images/img35.webp"
        alt="A dark and moody image of the inside of a gem mine, with rock walls and dim lighting."
        data-ai-hint="gem mine cave"
        fill
        className="z-0 object-cover"
      />
      <div className="absolute inset-0 bg-black/30 z-10" />
      <div className="relative z-20 flex flex-col items-center justify-center text-center text-foreground p-4 space-y-8">
        
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-6xl font-serif font-bold tracking-[0.2em] text-primary sm:text-8xl">
            SAPPHIRE
          </h1>
          <h2 className="text-3xl font-serif font-bold tracking-[0.4em] text-primary sm:text-5xl">
            TRAILS
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Sri Lanka's Only Luxury Gem Experience
          </p>
        </div>

        <Button asChild size="lg">
          <Link href="/booking">Book Now</Link>
        </Button>
      </div>
    </section>
  );
}
