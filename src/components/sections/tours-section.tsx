import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollAnimate } from '@/components/shared/scroll-animate';

const tours = [
  {
    title: 'Exclusive Sapphire Mine Tour with Hands-On Discovery',
    description: "Dive deep into the world of gem mining with expert guides. Discover the secrets behind Sri Lanka's most precious sapphires and immerse yourself in authentic local traditions.",
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'tourists mining',
    alt: 'A group of smiling tourists wearing hard hats on a sapphire mine tour.'
  },
  {
    title: 'Tea Estate & Luxury Dining',
    description: 'Savor the flavors of Sri Lanka with a private tour of a lush tea estate, followed by a curated gourmet dining experience in an elegant setting surrounded by nature.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'luxury gem logo',
    alt: 'The logo for Sapphire Trails Deluxe tours.'
  }
];

export function ToursSection() {
  return (
    <section id="tours" className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <ScrollAnimate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {tours.map((tour, index) => (
              <Card key={index} className="bg-card border-stone-800/50 flex flex-col w-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 rounded-xl overflow-hidden">
                <div className="relative h-64 w-full">
                  <Image
                    src={tour.imageUrl}
                    alt={tour.alt}
                    data-ai-hint={tour.imageHint}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <CardContent className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-headline font-bold text-primary mb-4">{tour.title}</h3>
                  <p className="text-muted-foreground mb-6 flex-grow">{tour.description}</p>
                  <Button asChild className="w-fit bg-primary text-primary-foreground hover:bg-primary/90 mt-auto rounded-full px-6">
                    <Link href="#booking">More Info</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollAnimate>
      </div>
    </section>
  );
}
