
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Clock, Star, ArrowRight, Users, Shield } from 'lucide-react';
import Link from 'next/link';

interface TourDetailHeroProps {
  title: string;
  duration: string;
  price: string;
  priceSuffix: string;
  imageUrl: string;
  imageHint: string;
  bookingLink: string;
}

export function TourDetailHero({ title, duration, price, priceSuffix, imageUrl, imageHint, bookingLink }: TourDetailHeroProps) {
  return (
    <section className="w-full bg-background-alt border-b border-border">
      <div className="container mx-auto max-w-screen-xl px-4 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-16 items-center py-14 md:py-20">

          {/* Left — Text Content */}
          <div className="flex flex-col justify-center order-2 lg:order-1 pt-8 lg:pt-0">
            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
              <span className="text-muted-foreground text-sm ml-1 font-medium">Premium Gem Tour</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-headline font-bold text-foreground leading-tight mb-5">
              {title}
            </h1>

            {/* Metadata pills */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground">
                <Clock className="h-4 w-4 text-primary" />
                {duration}
              </div>
              <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium">
                <span className="font-bold text-primary">{price}</span>
                <span className="text-muted-foreground">{priceSuffix}</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 mb-8 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" />
                <span>Safety Certified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                <span>Expert Guided</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-8 font-serif uppercase tracking-widest text-sm">
                <Link href={bookingLink} className="flex items-center gap-2">
                  Book This Tour
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 text-sm border-border">
                <a href="#itinerary">View Itinerary</a>
              </Button>
            </div>
          </div>

          {/* Right — Image */}
          <div className="order-1 lg:order-2">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-border">
              <Image
                src={imageUrl}
                alt={title}
                data-ai-hint={imageHint}
                fill
                priority
                className="object-cover object-center"
              />
              {/* Price overlay badge */}
              <div className="absolute bottom-4 left-4 rounded-xl bg-background/90 backdrop-blur-sm border border-border px-4 py-2.5 shadow-lg">
                <p className="text-xs text-muted-foreground font-medium">Starting from</p>
                <p className="text-xl font-bold text-primary font-headline">{price} <span className="text-sm font-normal text-muted-foreground">{priceSuffix}</span></p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
