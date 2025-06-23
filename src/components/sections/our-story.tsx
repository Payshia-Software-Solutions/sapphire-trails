import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';

const experiencePoints = [
    "Hands on gem mining adventures with local experts",
    "Curated tea estate tours and tastings",
    "Luxury stays in serene, architecturally iconic suites",
    "Private sapphire selection & jewelry workshops",
    "Cultural excursions and curated dining",
];

export function OurStory() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6">
        <div className="space-y-20">

          {/* Our Story */}
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-headline font-bold text-primary">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed">
                With over 27 years, Grand Silver Ray has set the standard for luxury gem tourism in Sri Lanka. Rooted in Ratnapura, the heart of sapphire country, our resort blends timeless elegance with the vibrant spirit of discovery. What began as a boutique retreat is now renowned worldwide for experiential hospitality, cultural immersion, and responsible luxury.
              </p>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                    src="https://placehold.co/600x400.png"
                    alt="Exterior of the Grand Silver Ray resort"
                    data-ai-hint="luxury hotel exterior"
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 hover:scale-105"
                />
            </div>
          </div>

          {/* The Experience */}
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative aspect-video rounded-lg overflow-hidden md:order-last">
                <Image
                    src="https://placehold.co/600x400.png"
                    alt="A collection of polished gemstones"
                    data-ai-hint="gemstone jewelry"
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 hover:scale-105"
                />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-headline font-bold text-primary">The Experience</h2>
              <ul className="space-y-3">
                {experiencePoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Who We Are */}
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-headline font-bold text-primary">Who We Are</h2>
              <p className="text-muted-foreground leading-relaxed">
                Sapphire Trail welcomes discerning travelers, luxury connoisseurs, and influencers seeking extraordinary stories. We are a sanctuary for those who appreciate rarity, authenticity, and the transformative power of nature's finest treasures.
              </p>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden">
                 <Image
                    src="https://placehold.co/600x400.png"
                    alt="A group of happy tourists on a tour"
                    data-ai-hint="tourist group smiling"
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 hover:scale-105"
                />
            </div>
          </div>

          <div className="text-center pt-8">
            <Button asChild size="lg" className="rounded-full px-10">
                <Link href="/booking">Book Now</Link>
            </Button>
          </div>
          
        </div>
      </div>
    </section>
  );
}
