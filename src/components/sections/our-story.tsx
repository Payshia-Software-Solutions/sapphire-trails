import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';

const AbstractShape = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="346" height="346" viewBox="0 0 346 346" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M222.95 0H318.333C333.856 0 346 12.1441 346 27.6667V123.05C346 138.572 333.856 150.717 318.333 150.717H222.95C207.428 150.717 195.283 138.572 195.283 123.05V27.6667C195.283 12.1441 207.428 0 222.95 0Z" fill="hsl(var(--card))"/>
    <path d="M27.6667 195.283H123.05C138.572 195.283 150.717 207.428 150.717 222.95V318.333C150.717 333.856 138.572 346 123.05 346H27.6667C12.1441 346 0 333.856 0 318.333V222.95C0 207.428 12.1441 195.283 27.6667 195.283Z" fill="hsl(var(--card))"/>
  </svg>
);

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
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-headline font-bold text-primary mb-4">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed">
                With over 27 years, Grand Silver Ray has set the standard for luxury gem tourism in Sri Lanka. Rooted in Ratnapura, the heart of sapphire country, our resort blends timeless elegance with the vibrant spirit of discovery. What began as a boutique retreat is now renowned worldwide for experiential hospitality, cultural immersion, and responsible luxury.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-headline font-bold text-primary mb-4">The Experience</h2>
              <ul className="space-y-3">
                {experiencePoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-3xl font-headline font-bold text-primary mb-4">Who We Are</h2>
              <p className="text-muted-foreground leading-relaxed">
                Sapphire Trail welcomes discerning travelers, luxury connoisseurs, and influencers seeking extraordinary stories. We are a sanctuary for those who appreciate rarity, authenticity, and the transformative power of nature's finest treasures.
              </p>
            </div>
            <Button asChild size="lg" className="rounded-full px-10">
                <Link href="/contact">Book Now</Link>
            </Button>
          </div>
          <div className="hidden md:flex justify-center items-center">
            <AbstractShape className="w-full max-w-md h-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
