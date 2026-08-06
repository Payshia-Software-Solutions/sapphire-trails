
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Clock, Star, ArrowRight } from 'lucide-react';
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
    <section className="relative h-[75vh] min-h-[520px] w-full flex items-end bg-black">
      {/* Hero Image */}
      <Image
        src={imageUrl}
        alt={title}
        data-ai-hint={imageHint}
        fill
        priority
        className="z-0 object-cover object-center"
      />

      {/* Deep gradient overlay — bottom heavy for text legibility */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/50 to-transparent" />

      {/* Content */}
      <div className="relative z-20 w-full container mx-auto max-w-screen-2xl px-4 md:px-10 pb-14 md:pb-20">
        {/* Rating badge */}
        <div className="flex items-center gap-1.5 mb-5">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
          ))}
          <span className="text-white/70 text-sm ml-1">Premium Gem Tour</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-white leading-tight max-w-3xl">
          {title}
        </h1>

        {/* Metadata pills */}
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 backdrop-blur-sm text-white text-sm font-medium">
            <Clock className="h-4 w-4 text-primary" />
            {duration}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/20 px-5 py-2 backdrop-blur-sm text-white text-sm font-medium">
            <span className="font-bold text-primary text-base">{price}</span>
            <span className="text-white/70">{priceSuffix}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8">
          <Button asChild size="lg" className="rounded-full px-8 font-serif uppercase tracking-widest text-sm">
            <Link href={bookingLink} className="flex items-center gap-2">
              Book This Tour
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
