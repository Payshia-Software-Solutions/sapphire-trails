
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AboutCtaSection() {
  return (
    <section className="w-full py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl mb-4">
          Ready to Unearth Your Own Treasure?
        </h2>
        <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl/relaxed mb-8">
          Join us for an unforgettable journey into the heart of Sri Lanka’s gem industry.
        </p>
        <Button asChild size="lg">
          <Link href="/booking">Book Your Gem Mine Tour</Link>
        </Button>
      </div>
    </section>
  );
}
