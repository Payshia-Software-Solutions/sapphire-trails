import Image from 'next/image';

interface LocationHeroProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageHint: string;
}

export function LocationHero({ title, subtitle, imageUrl, imageHint }: LocationHeroProps) {
  return (
    <section className="relative h-[60vh] w-full flex items-center justify-center bg-background">
      <Image
        src={imageUrl}
        alt={`A scenic view of ${title}`}
        data-ai-hint={imageHint}
        fill
        className="z-0 opacity-50 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent z-10" />
      <div className="relative z-20 flex flex-col items-center justify-center text-center text-foreground p-4">
        <h1 className="text-5xl font-headline font-bold tracking-tight text-primary sm:text-7xl">
          {title}
        </h1>
        <p className="mt-4 text-2xl text-muted-foreground font-headline tracking-widest">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
