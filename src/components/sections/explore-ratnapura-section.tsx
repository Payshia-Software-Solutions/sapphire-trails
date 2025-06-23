import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollAnimate } from '@/components/shared/scroll-animate';

const gallery = [
  {
    src: 'https://placehold.co/600x400.png',
    alt: 'A beautiful cascading waterfall in a lush, green jungle environment.',
    hint: 'jungle waterfall',
  },
  {
    src: 'https://placehold.co/600x400.png',
    alt: 'A family of elephants walking near a tour jeep in a grassy, wooded area.',
    hint: 'elephants safari',
  },
  {
    src: 'https://placehold.co/600x400.png',
    alt: 'Sunlight filtering through a dense bamboo forest with thick vines.',
    hint: 'bamboo forest',
  },
];

export function ExploreRatnapuraSection() {
  return (
    <section id="ratnapura" className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <ScrollAnimate className="flex flex-col items-center text-center space-y-8">
          <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl">
            Explore Ratnapura
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {gallery.map((image, index) => (
              <div key={index} className="overflow-hidden rounded-xl">
                <Image
                  src={image.src}
                  alt={image.alt}
                  data-ai-hint={image.hint}
                  width={600}
                  height={400}
                  className="object-cover w-full h-full transform transition-transform duration-500 hover:scale-110"
                />
              </div>
            ))}
          </div>
          
          <div className="max-w-3xl">
            <p className="text-lg text-muted-foreground">
              From waterfalls to ancient temples and vibrant bazaars, Ratnapura is a treasure trove for explorers. Discover what makes this region truly shine.
            </p>
          </div>

          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="#booking">Book Now</Link>
          </Button>
        </ScrollAnimate>
      </div>
    </section>
  );
}
