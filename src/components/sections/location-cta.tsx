import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Phone, MapPin } from "lucide-react";

export function LocationCta() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl mb-4">
          Ready to Explore?
        </h2>
        <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl/relaxed mb-8">
          Book your guided tour to Sinharaja Rainforest and experience Sri Lanka's natural treasure.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/#contact">Book a Tour</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
            <Link href="tel:+94771234567">
              <Phone className="mr-2 h-5 w-5" />
              Contact a Guide
            </Link>
          </Button>
           <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
            <Link href="#">
               <MapPin className="mr-2 h-5 w-5" />
               Get Directions
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
