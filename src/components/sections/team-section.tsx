import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Facebook, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';

const teamMembers = [
    {
        name: "Mr. Nimal Silva",
        role: "Chairman",
        image: "https://placehold.co/400x400.png",
        imageHint: "man portrait professional",
        bio: "Worem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis."
    },
    {
        name: "Mr. Nimal Silva",
        role: "Senior Director",
        image: "https://placehold.co/400x400.png",
        imageHint: "man portrait professional",
        bio: "Worem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis."
    },
    {
        name: "Mr. Nimal Silva",
        role: "Assistant Director",
        image: "https://placehold.co/400x400.png",
        imageHint: "professional portrait",
        bio: "Worem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis."
    },
    {
        name: "Mr. Nimal Silva",
        role: "HR Manager",
        image: "https://placehold.co/400x400.png",
        imageHint: "professional portrait",
        bio: "Worem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis."
    }
];

export function TeamSection() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl">Our Team</h2>
                    <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
                        Worem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {teamMembers.map((member, index) => (
                        <Card key={index} className="bg-card border-stone-800/50 flex flex-col w-full rounded-xl overflow-hidden shadow-lg text-center">
                            <div className="relative h-64 w-full bg-muted">
                                <Image
                                    src={member.image}
                                    alt={`Portrait of ${member.name}`}
                                    data-ai-hint={member.imageHint}
                                    layout="fill"
                                    objectFit="cover"
                                />
                            </div>
                            <CardContent className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold font-headline text-primary">{member.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{member.role}</p>
                                <p className="text-sm text-muted-foreground flex-grow">{member.bio}</p>
                                <div className="flex justify-center gap-4 mt-4">
                                    <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook size={20} /></Link>
                                    <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter size={20} /></Link>
                                    <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin size={20} /></Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
