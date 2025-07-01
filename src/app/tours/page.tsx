
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ToursHero } from '@/components/sections/tours-hero';
import { Faq } from '@/components/sections/faq';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { initialTourPackages, type TourPackage } from '@/lib/packages-data';

const TourCard = ({ tour }: { tour: TourPackage }) => (
  <Card className="bg-card border-stone-800/50 flex flex-col w-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 rounded-xl overflow-hidden">
    <div className="relative h-64 w-full">
      <Image
        src={tour.imageUrl}
        alt={tour.imageAlt}
        data-ai-hint={tour.imageHint}
        fill
        className="object-cover"
      />
    </div>
    <CardContent className="p-8 flex flex-col flex-grow">
      <h3 className="text-2xl font-headline font-bold text-primary mb-4">{tour.homepageTitle}</h3>
      <p className="text-muted-foreground mb-6 flex-grow">{tour.homepageDescription}</p>
      <Button asChild className="w-fit bg-primary text-primary-foreground hover:bg-primary/90 mt-auto rounded-full px-6">
        <Link href={`/tours/${tour.id}`}>More Info</Link>
      </Button>
    </CardContent>
  </Card>
);

const mapServerPackageToClient = (pkg: any): TourPackage => ({
  id: pkg.id,
  imageUrl: pkg.homepage_image_url,
  imageAlt: pkg.homepage_image_alt || '',
  imageHint: pkg.homepage_image_hint || '',
  homepageTitle: pkg.homepage_title,
  homepageDescription: pkg.homepage_description,
  tourPageTitle: pkg.tour_page_title,
  duration: pkg.duration,
  price: pkg.price,
  priceSuffix: pkg.price_suffix,
  heroImage: pkg.hero_image_url,
  heroImageHint: pkg.hero_image_hint,
  tourPageDescription: pkg.tour_page_description,
  tourHighlights: pkg.highlights || [],
  inclusions: pkg.inclusions ? pkg.inclusions.map((i: { text: string }) => i.text) : [],
  itinerary: pkg.itinerary || [],
  bookingLink: pkg.booking_link,
});

function AllToursGrid() {
    const [allTours, setAllTours] = useState<TourPackage[]>([]);

    useEffect(() => {
        async function fetchTours() {
            try {
                const response = await fetch('http://localhost/sapphire_trails_server/tours');
                 if (!response.ok) throw new Error('Failed to fetch');

                const data = await response.json();
                if (Array.isArray(data)) {
                    const combinedTours = [...initialTourPackages];
                    const serverTours = data.map(mapServerPackageToClient);
                    
                    const uniqueTours: { [key: string]: TourPackage } = {};
                    for (const pkg of combinedTours) {
                        uniqueTours[pkg.id] = pkg;
                    }
                     for (const pkg of serverTours) {
                        uniqueTours[pkg.id] = pkg;
                    }

                    setAllTours(Object.values(uniqueTours));
                } else {
                    setAllTours(initialTourPackages);
                }
            } catch (e) {
                console.error("Failed to parse custom packages", e);
                setAllTours(initialTourPackages);
            }
        }
        fetchTours();
    }, []);

    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
                    {allTours.map((tour) => (
                        <TourCard key={tour.id} tour={tour} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default function ToursPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 bg-background-alt">
        <ToursHero />
        <AllToursGrid />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
