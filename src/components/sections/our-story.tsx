import Image from 'next/image';

export function OurStory() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 bg-background-alt">
      <div className="flex items-center justify-center p-8 md:p-12 lg:p-24">
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-headline font-bold text-primary">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed">
            With over 27 years experience in the hospitality industry, Grand Silver Ray has set the standard for premier gem tourism in Sri Lanka. Rooted in Ratnapura, the heart of sapphire country, our resort blends timeless elegance with the vibrant spirit of discovery. What began as a boutique retreat is now renowned worldwide for experiential hospitality, cultural immersion, and responsible tourism.
          </p>
        </div>
      </div>
      <div className="relative min-h-[50vh] md:min-h-0">
        <Image
          src="https://content-provider.payshia.com/sapphire-trail/images/img31.webp"
          alt="Exterior of the Grand Silver Ray resort"
          data-ai-hint="luxury suite"
          fill
          className="object-cover"
        />
      </div>
    </section>
  );
}
