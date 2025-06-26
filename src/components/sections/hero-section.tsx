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
          <Image src="/img/logo3.png" alt="Sapphire Trails - Professional Gem Tours Logo" width={450} height={225} />
        </div>

        <Button asChild size="lg">
          <Link href="/booking">Book Now</Link>
        </Button>
      </div>
    </section>
  );
}
