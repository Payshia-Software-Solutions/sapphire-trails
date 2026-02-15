
import Image from 'next/image';

export function EthicalMiningSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-headline font-bold text-primary">Our Commitment to Ethical Mining</h2>
            <div className="w-24 h-px bg-primary"></div>
            <p className="text-muted-foreground leading-relaxed">
              At Sapphire Trails, we believe the beauty of a gemstone begins with how it is sourced. We partner exclusively with government-licensed mines in Ratnapura that adhere to strict environmental and safety standards. Our ethical gem mine tours support local artisan miners, ensuring fair wages and safe working conditions. After mining, we support land restoration projects that return the earth to its natural state.
            </p>
          </div>
          <div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-lg">
              <Image
                src="https://picsum.photos/seed/ethical-mining/600/450"
                alt="Artisan miners working in a lush, green environment, signifying ethical practices."
                data-ai-hint="miners hands"
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
