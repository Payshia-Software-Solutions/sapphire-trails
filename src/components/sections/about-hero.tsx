import Image from 'next/image';

export function AboutHero() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center bg-background scroll-section">
      <Image
        src="https://content-provider.payshia.com/sapphire-trail/images/img35.webp"
        alt="A dark and moody image of the inside of a gem mine, with rock walls and dim lighting."
        data-ai-hint="gem mine cave"
        fill
        className="z-0 opacity-40 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
      <div className="relative z-20 flex flex-col items-center justify-center text-center text-foreground p-4">
        <h1 className="text-5xl font-headline font-bold tracking-tight text-primary sm:text-6xl">
          About Sapphire Trails
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Sri Lanka&apos;s First Gem Mining Experience
        </p>
      </div>
    </section>
  );
}
