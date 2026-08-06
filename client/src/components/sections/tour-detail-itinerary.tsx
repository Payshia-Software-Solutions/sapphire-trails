import type { ItineraryItem } from "@/lib/packages-data";

interface TourDetailItineraryProps {
    itinerary: ItineraryItem[];
}

export function TourDetailItinerary({ itinerary }: TourDetailItineraryProps) {
    if (!itinerary || itinerary.length === 0) {
        return null;
    }

    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <h2 className="text-3xl font-headline font-bold text-center mb-12 text-primary sm:text-4xl">
                    Daily Itinerary
                </h2>
                <div className="max-w-3xl mx-auto space-y-4">
                    {itinerary.map((item, index) => (
                        <div key={index} className="flex items-center gap-6 p-6 rounded-lg bg-card">
                            <div className="text-center shrink-0 w-20">
                                <p className="text-lg font-bold text-primary">{item.time.split(' ')[0]}</p>
                                <p className="text-sm text-muted-foreground">{item.time.split(' ')[1]}</p>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold font-headline text-foreground">{item.title}</h3>
                                <p className="text-muted-foreground mt-1">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
