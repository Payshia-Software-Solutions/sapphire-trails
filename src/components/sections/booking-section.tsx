import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollAnimate } from '@/components/shared/scroll-animate';

export function BookingSection() {
  return (
    <section id="booking" className="w-full h-screen flex items-center justify-center bg-background scroll-section">
      <div className="container px-4 md:px-6 mx-auto">
        <ScrollAnimate className="mx-auto flex flex-col items-center justify-center gap-6 text-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl">
              Reserve Your Adventure
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              Book your spot for an unforgettable luxury tour experience. Contact us for custom itineraries, group rates, and exclusive offers.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full px-10 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/tours">Reserve</Link>
          </Button>
        </ScrollAnimate>
      </div>
    </section>
  );
}
