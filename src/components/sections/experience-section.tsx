import Image from 'next/image';
import { Check } from 'lucide-react';

const experiencePoints = [
    "Hands on gem mining adventures with local experts",
    "Curated tea estate tours and tastings",
    "Premier stays in serene, architecturally iconic suites",
    "Private sapphire selection & jewelry workshops",
    "Cultural excursions and curated dining",
];

export function ExperienceSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <Image
              src="https://content-provider.payshia.com/sapphire-trail/images/img2.webp"
              alt="A person sifting for gems in a woven basket"
              data-ai-hint="gem mining sifting"
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-headline font-bold text-primary">The Experience</h2>
            <ul className="space-y-4">
              {experiencePoints.map((point, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground text-lg">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
