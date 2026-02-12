
import Image from 'next/image';

export function AboutHero() {
  return (
    <section className="relative bg-background py-20 md:py-32 lg:py-40 overflow-hidden">
      <Image
        src="https://content-provider.payshia.com/sapphire-trail/images/img35.webp"
        alt="Background image of a gem mine"
        data-ai-hint="gem mine"
        fill
        className="z-0 object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
      <div className="container relative z-20 mx-auto px-4 md:px-6 text-center">
        <h1 className="text-4xl font-headline font-bold text-white md:text-6xl">
          About Sapphire Trails
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Sri Lanka&apos;s First Gem Mining Experience
        </p>
      </div>
    </section>
  );
}
