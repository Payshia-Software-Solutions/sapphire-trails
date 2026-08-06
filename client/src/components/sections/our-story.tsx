
import Image from 'next/image';

export function OurStory() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
                <div className="space-y-4 text-left">
                    <h2 className="text-3xl font-headline font-bold text-primary">Our Story</h2>
                    <h3 className="font-serif text-2xl tracking-[0.2em] text-primary/80">SAPPHIRE TRAILS</h3>
                    <div className="w-24 h-px bg-primary"></div>
                    <p className="text-muted-foreground leading-relaxed mt-4">
                        With over 27 years of experience in the hospitality industry, Grand Silver Ray has set the standard for premier gem tourism in Sri Lanka. Our story is deeply rooted in Ratnapura, the heart of sapphire country, where our resort blends timeless elegance with the vibrant spirit of discovery. What began as a boutique retreat has blossomed into an internationally renowned destination for experiential hospitality, cultural immersion, and responsible tourism. We envisioned a unique offering that went beyond a simple hotel stay—an authentic Sri Lankan gem tour that connects travelers with the rich history and living culture of gem mining. Sapphire Trails was born from this vision, created to provide discerning adventurers with an unparalleled, all-inclusive gem experience. We pride ourselves on our deep local knowledge, our commitment to the community, and our passion for sharing the magic of Sri Lanka's gem heritage with the world.
                    </p>
                </div>
                <div>
                     <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-lg">
                        <Image
                            src="https://content-provider.payshia.com/sapphire-trail/images/img31.webp"
                            alt="Exterior of the Grand Silver Ray resort"
                            data-ai-hint="luxury suite"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}
