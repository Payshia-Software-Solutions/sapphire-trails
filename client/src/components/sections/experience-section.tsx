
import Image from 'next/image';
import { Gem, BedDouble, Award, Leaf } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const experienceItems = [
    {
        title: "Authentic Gem Mining",
        description: "Experience the thrill of the hunt with hands-on gem mining adventures led by local experts in the heart of Ratnapura.",
        icon: Gem,
        image: {
            src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-1-optimized.webp',
            alt: 'A tourist gets fitted with a safety harness before a gem tour',
            hint: 'gem tour safety'
        }
    },
    {
        title: "Luxury Stays",
        description: "Unwind in serene, architecturally iconic suites at the Grand Silver Ray, our exclusive hospitality partner.",
        icon: BedDouble,
        image: {
            src: 'https://content-provider.payshia.com/silver-ray/room-images/89/BEDROOM-1-optimized-69470fe99fc4c.webp',
            alt: 'A luxurious and modern hotel room interior at Grand Silver Ray, our hospitality partner.',
            hint: 'luxury hotel room'
        }
    },
    {
        title: "Expert Workshops",
        description: "Engage in private sapphire selection and traditional gem cutting workshops with our certified gemologists.",
        icon: Award,
        image: {
            src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-7-optimized.webp',
            alt: 'A craftsman using a traditional gem cutting wheel',
            hint: 'gem cutting wheel'
        }
    },
    {
        title: "Cultural Immersions",
        description: "Beyond the mines, enjoy curated tea estate tours, local culinary experiences, and excursions to cultural landmarks.",
        icon: Leaf,
        image: {
             src: 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp',
             alt: 'A collection of colorful polished gemstones representing Sri Lankan culture',
             hint: 'gemstones collection'
        }
    },
];

export function ExperienceSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
        <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl font-headline font-bold text-primary">The Sapphire Trails Experience</h2>
                <p className="mt-4 text-muted-foreground md:text-xl/relaxed">A true luxury gem tour is a multi-faceted experience. It’s about the thrill of the hunt, the connection to culture, and the comfort of world-class hospitality, all woven into one unforgettable adventure.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {experienceItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <Card key={index} className="bg-card border-border/50 flex flex-col w-full rounded-xl shadow-lg text-center">
                           {item.image && (
                                <div className="relative h-48 w-full rounded-t-xl overflow-hidden">
                                    <Image
                                        src={item.image.src}
                                        alt={item.image.alt}
                                        data-ai-hint={item.image.hint}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                           )}
                            <div className="relative z-10 flex justify-center -mt-8">
                                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 border-4 border-background-alt bg-background">
                                    <Icon className="h-8 w-8 text-primary" />
                                </div>
                            </div>
                           <CardContent className="p-6 pt-4 flex flex-col flex-grow items-center">
                                <h3 className="text-xl font-bold font-headline text-foreground">{item.title}</h3>
                                <p className="text-sm text-muted-foreground mt-2 flex-grow">{item.description}</p>
                           </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    </section>
  );
}
