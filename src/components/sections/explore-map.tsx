import Image from 'next/image';

export function ExploreMap() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl">Explore Ratnapura on the Map</h2>
                </div>
                <div className="max-w-6xl mx-auto rounded-lg overflow-hidden border border-border shadow-lg">
                     <Image
                        src="https://placehold.co/1200x600.png"
                        alt="Map of Ratnapura area"
                        data-ai-hint="sri lanka map"
                        width={1200}
                        height={600}
                        className="w-full h-auto"
                    />
                </div>
            </div>
        </section>
    );
}
