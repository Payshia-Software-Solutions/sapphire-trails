
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign } from 'lucide-react';
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
    <section className="relative h-[65vh] w-full flex items-center justify-center bg-background text-white">
      <Image
        src={imageUrl}
        alt={title}
        data-ai-hint={imageHint}
        fill
        className="z-0 opacity-40 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-transparent z-10" />
      <div className="relative z-20 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-5xl font-headline font-bold tracking-tight text-white sm:text-7xl">
          {title}
        </h1>
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-lg">
            <div className="flex items-center gap-2 rounded-full bg-black/30 px-4 py-2 backdrop-blur-sm">
                <Clock className="h-5 w-5 text-primary"/>
                <span>{duration}</span>
            </div>
             <div className="flex items-center gap-2 rounded-full bg-black/30 px-4 py-2 backdrop-blur-sm">
                <span className="font-semibold">{price}</span>
                <span className="text-sm opacity-80">{priceSuffix}</span>
            </div>
        </div>
        <Button asChild size="lg" className="mt-8">
            <Link href={bookingLink}>Book Now</Link>
        </Button>
      </div>
    </section>
  );
}
