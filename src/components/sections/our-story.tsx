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
    <section className="w-full h-screen flex items-center justify-center bg-background-alt scroll-section">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-headline font-bold text-primary">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed">
                With over 27 years experience in the hospitality industry, Grand Silver Ray has set the standard for luxury gem tourism in Sri Lanka. Rooted in Ratnapura, the heart of sapphire country, our resort blends timeless elegance with the vibrant spirit of discovery. What began as a boutique retreat is now renowned worldwide for experiential hospitality, cultural immersion, and responsible luxury.
              </p>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                    src="https://content-provider.payshia.com/sapphire-trail/images/img31.webp"
                    alt="Exterior of the Grand Silver Ray resort"
                    data-ai-hint="luxury suite"
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                />
            </div>
        </div>
      </div>
    </section>
  );
}
