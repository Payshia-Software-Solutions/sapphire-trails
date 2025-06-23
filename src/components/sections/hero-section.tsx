"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TaglineGenerator } from '@/components/shared/tagline-generator';
import Image from 'next/image';

export function HeroSection() {
  const [headline, setHeadline] = useState("Craft Your Perfect Landing Page in Minutes");
  const sectionDescription = "A hero section for a website builder called 'Landing Spark'. It helps users create beautiful and effective landing pages quickly using AI. The tone should be inspiring and empowering.";

  return (
    <section className="w-full py-20 md:py-32 lg:py-40 bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-24 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl md:text-6xl text-primary-foreground/90">
                {headline}
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Unlock your potential with Landing Spark. Our AI-driven platform helps you build stunning, high-converting landing pages with zero code.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="#contact">Get Started Now</Link>
              </Button>
            </div>
             <TaglineGenerator 
              sectionDescription={sectionDescription}
              onTaglineSelect={setHeadline}
              currentTagline={headline}
            />
          </div>
          <Image
            src="https://placehold.co/600x400.png"
            alt="Hero Image"
            data-ai-hint="website builder interface"
            width={600}
            height={400}
            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
          />
        </div>
      </div>
    </section>
  );
}
