
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ScrollAnimate } from '../shared/scroll-animate';
import { cn } from '@/lib/utils';
import { CalendarCheck, ChevronDown } from 'lucide-react';

const CMS_DATA_KEY = 'sapphire-cms-data';

const defaultContent = {
  headline: "Sri Lanka Gem Mine Tour - An Exclusive Luxury Experience",
  subheadline: "Discover the world's finest sapphires in Ratnapura with a professional gem mine tour.",
};


export function HeroSection() {
  const [content, setContent] = useState(defaultContent);
  const [isVideoVisible, setIsVideoVisible] = useState(false);

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
    <section className="relative h-[calc(100vh-3rem)] w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Static poster image */}
      <Image
        src="https://content-provider.payshia.com/sapphire-trail/images/img35.webp"
        alt="A dark, moody gem mine interior which serves as a background poster."
        fill
        className="absolute z-0 object-cover"
        priority
      />

      {/* Video fades in on top */}
      <video
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={() => setIsVideoVisible(true)}
          className={cn(
              "absolute z-10 w-auto min-w-full min-h-full max-w-none object-cover transition-opacity duration-1000",
              isVideoVisible ? "opacity-100" : "opacity-0"
          )}
      >
          <source src="https://content-provider.payshia.com/sapphire-trail/hero/hero-video-sapphire-trail.webm" type="video/webm" />
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
          <h2 className="text-lg text-white/90 max-w-2xl">
            {content.subheadline}
          </h2>
        </div>

        <Button asChild size="lg">
          <Link href="/booking">
            <CalendarCheck className="mr-2 h-5 w-5" />
            Book Now
          </Link>
        </Button>
      </ScrollAnimate>

      {/* Scroll Down Indicator */}
      <Link
        href="#about"
        className="absolute bottom-10 z-20 animate-scroll-down"
        aria-label="Scroll to next section"
      >
        <ChevronDown className="h-10 w-10 text-white" />
      </Link>
    </section>
  );
}
