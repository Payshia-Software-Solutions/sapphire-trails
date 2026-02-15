"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ScrollAnimate } from '../shared/scroll-animate';

const CMS_DATA_KEY = 'sapphire-cms-data';

const defaultContent = {
  headline: "Exclusive Gem Mine Tours in Sri Lanka",
  subheadline: "Experience luxury, culture, and adventure",
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

  return (
    <section className="relative h-screen w-full flex items-center justify-center scroll-section overflow-hidden">
        <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover"
            poster="https://content-provider.payshia.com/sapphire-trail/images/img35.webp"
        >
            <source src="https://content-provider.payshia.com/sapphire-trail/hero/sapphire-trails-her-video.webm" type="video/webm" />
        </video>
      
      <ScrollAnimate className="relative z-20 flex flex-col items-center justify-center text-center text-white p-4 space-y-6">
        
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
      </ScrollAnimate>
    </section>
  );
}
