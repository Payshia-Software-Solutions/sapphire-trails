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
        layout="fill"
        objectFit="cover"
        className="z-0"
      />
      <div className="absolute inset-0 bg-black/70 z-10" />
      <div className="relative z-20 flex flex-col items-center justify-center text-center text-foreground p-4 space-y-8">
        
        <div className="flex flex-col items-center space-y-4">
            <Image src="/img/logo.png" alt="Sapphire Trails Logo" width={300} height={150} />
        </div>

        <div className="space-y-4 max-w-4xl">
            <h1 className="text-5xl font-headline font-bold tracking-tight sm:text-6xl md:text-7xl">
                Sri Lanka's Only Luxury Gem Experience
            </h1>
            <p className="font-body text-xl md:text-2xl tracking-widest font-normal text-foreground/90">
                Experience luxury, culture, and adventure
            </p>
        </div>

        <Button asChild size="lg">
          <Link href="/booking">Book Now</Link>
        </Button>
      </div>
    </section>
  );
}
