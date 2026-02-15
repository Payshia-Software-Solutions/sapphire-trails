
import Image from 'next/image';
import { Check } from 'lucide-react';

const experiencePoints = [
    "Hands on gem mining adventures with local experts",
    "Curated tea estate tours and tastings",
    "Luxury stays in serene, architecturally iconic suites",
    "Private sapphire selection & jewelry workshops",
    "Cultural excursions and curated dining",
];

const experienceImages = [
    {
        src: 'https://content-provider.payshia.com/sapphire-trail/images/img2.webp',
        alt: 'A person sifting for gems in a woven basket',
        hint: 'gem mining sifting'
    },
    {
        src: 'https://content-provider.payshia.com/sapphire-trail/images/img31.webp',
        alt: 'Exterior of the Grand Silver Ray resort',
        hint: 'luxury suite'
    },
    {
        src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-4-optimized.webp',
        alt: 'A couple examines a glowing gemstone with a light tool.',
        hint: 'examining gemstone'
    },
    {
        src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-7-optimized.webp',
        alt: 'A person sharpens a tool on a traditional gem cutting wheel.',
        hint: 'gem cutting wheel'
    }
];

export function ExperienceSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
                 <div className="grid grid-cols-2 gap-4">
                    {experienceImages.map((image, index) => (
                        <div key={index} className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg group">
                            <Image
                                src={image.src}
                                alt={image.alt}
                                data-ai-hint={image.hint}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                        </div>
                    ))}
                 </div>
                <div className="space-y-6">
                    <h2 className="text-3xl font-headline font-bold text-primary">The Experience</h2>
                    <p className="text-muted-foreground leading-relaxed">At Sapphire Trails, we believe a true luxury gem tour is a multi-faceted experience. It’s about the thrill of the hunt, the connection to culture, and the comfort of world-class hospitality. We have meticulously crafted every detail of our gem tours to ensure an adventure that is as enriching as it is exhilarating. Our all-inclusive packages are designed to immerse you fully in the world of Sri Lankan gems, from the moment you arrive.</p>
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
