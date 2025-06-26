import Image from 'next/image';

export function BookingHero() {
  return (
    <section className="relative h-[50vh] w-full flex items-center justify-center bg-background">
      <Image
        src="https://images.unsplash.com/photo-1550450009-3b80827e8817?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxN3x8Z2VtJTIwdHJhaWwlMjB1bmRlcmdyb3VuZHxlbnwwfHx8fDE3NTA3MDQ5OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
        alt="A dark and moody image of the inside of a gem mine, with rock walls and dim lighting."
        data-ai-hint="gem mine cave"
        fill
        className="z-0 opacity-40 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background-alt via-background-alt/50 to-transparent z-10" />
      <div className="relative z-20 flex flex-col items-center justify-center text-center text-foreground p-4">
        <h1 className="text-5xl font-headline font-bold tracking-tight text-primary sm:text-6xl">
          Book Your Tour
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Reserve your spot for an unforgettable adventure.
        </p>
      </div>
    </section>
  );
}
