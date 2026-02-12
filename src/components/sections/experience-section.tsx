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
    <section className="grid grid-cols-1 md:grid-cols-2 bg-background">
      <div className="relative min-h-[50vh] md:min-h-0 md:order-2">
        <Image
          src="https://content-provider.payshia.com/sapphire-trail/images/img2.webp"
          alt="A person sifting for gems in a woven basket"
          data-ai-hint="gem mining sifting"
          fill
          className="object-cover"
        />
      </div>
      <div className="flex items-center justify-center p-8 md:p-12 lg:p-24 md:order-1">
        <div className="max-w-md space-y-6">
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
    </section>
  );
}
