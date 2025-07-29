
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getFullImageUrl } from '@/lib/utils';

const CMS_DATA_KEY = 'sapphire-cms-data';

const defaultContent = {
  headline: "Sri Lanka's Only Luxury Gem Experience",
  subheadline: "Experience luxury, culture, and adventure",
  imageUrl: "https://content-provider.payshia.com/sapphire-trail/images/img35.webp",
  imageAlt: "A dark and moody image of the inside of a gem mine, with rock walls and dim lighting.",
  imageHint: "gem mine cave",
};


export function HeroSection() {
  const [content, setContent] = useState(defaultContent);

  useEffect(() => {
    try {
      const storedDataRaw = localStorage.getItem(CMS_DATA_KEY);
      if (storedDataRaw) {
        const storedData = JSON.parse(storedDataRaw);
        if (storedData.hero) {
          setContent({ ...defaultContent, ...storedData.hero });
        }
      }
    } catch (error) {
      console.error("Failed to load hero section CMS data", error);
    }
  }, []);

  const finalImageUrl = getFullImageUrl(content.imageUrl);

  return (
    <section className="relative h-screen w-full flex items-center justify-center scroll-section">
      <Image
        src={finalImageUrl}
        alt={content.imageAlt}
        data-ai-hint={content.imageHint}
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
            className="h-auto w-[200px] sm:w-[250px]"
          />
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-white max-w-3xl">
            {content.headline}
          </h1>
          <p className="text-lg text-white/90">
            {content.subheadline}
          </p>
        </div>

        <Button asChild size="lg">
          <Link href="/booking">Book Now</Link>
        </Button>
      </div>
    </section>
  );
}
