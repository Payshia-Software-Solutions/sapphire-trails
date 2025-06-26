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
      <div className="absolute inset-0 bg-black/50 z-10" />
      <div className="relative z-20 flex flex-col items-center justify-center text-center text-white p-4 space-y-6">
        
        <div className="flex flex-col items-center space-y-4">
          <Image
            src="/img/logo4.png"
            alt="Sapphire Trails Logo"
            width={250}
            height={400}
            className="h-auto"
          />
          <p className="font-serif text-4xl tracking-[0.2em] text-primary">
            SAPPHIRE TRAILS
          </p>
          <h1 className="text-5xl font-headline font-bold tracking-tight text-white max-w-3xl">
            Sri Lanka's Only Luxury Gem Experience
          </h1>
          <p className="text-lg text-white/90">
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
