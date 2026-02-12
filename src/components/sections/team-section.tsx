import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Facebook, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';

const teamMembers = [
    {
        name: "Mr Nelaka Upasena",
        role: "Managing Director",
        bio: "With a profound passion for Sri Lanka's heritage, Nelaka leads Sapphire Trails in delivering unparalleled gem-centric experiences."
    },
    {
        name: "Mr Manuranga",
        role: "Gemologist",
        bio: "A certified gemologist, Manuranga's expertise guides our guests through the fascinating world of precious stones, from mine to market."
    },
    {
        name: "Mr Anurudda Gamage",
        role: "General Manager",
        bio: "Anurudda ensures every aspect of your journey is seamless, overseeing all operations with meticulous attention to detail."
    },
    {
        name: "Mr. Indika Senevirathna",
        role: "Restaurants Manager",
        bio: "Indika curates our exquisite dining experiences, blending local flavors with international cuisine to delight every palate."
    }
];

// Helper to get initials from a name
const getInitials = (name: string) => {
  const nameWithoutTitle = name.replace(/Mr\.?\s/g, '');
  const names = nameWithoutTitle.split(' ').filter(n => n);
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`;
  }
  return names[0] ? names[0].substring(0, 2) : '';
};

export function TeamSection() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl">Our Team</h2>
                    <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
                        Meet the dedicated professionals who make the Sapphire Trails experience unforgettable.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {teamMembers.map((member, index) => (
                        <Card key={index} className="bg-card border-stone-800/50 flex flex-col w-full rounded-xl shadow-lg text-center">
                            <CardContent className="p-6 flex flex-col flex-grow items-center">
                                <Avatar className="w-32 h-32 mb-6 border-4 border-primary/20 text-3xl">
                                    <AvatarFallback className="bg-muted text-muted-foreground">{getInitials(member.name)}</AvatarFallback>
                                </Avatar>
                                <h3 className="text-xl font-bold font-headline text-primary">{member.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{member.role}</p>
                                <p className="text-sm text-muted-foreground flex-grow text-center">{member.bio}</p>
                                <div className="flex justify-center gap-4 mt-6">
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
