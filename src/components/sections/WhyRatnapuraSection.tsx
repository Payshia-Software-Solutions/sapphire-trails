
import Image from 'next/image';

export function WhyRatnapuraSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-headline font-bold text-primary">Why Ratnapura? The City of Gems</h2>
            <div className="w-24 h-px bg-primary"></div>
            <p className="text-muted-foreground leading-relaxed">
              Ratnapura (meaning 'City of Gems' in Sinhala) is the global capital of sapphires. The unique geology of the Sabaragamuwa province has produced some of the world's most famous stones, including the 'Star of India.' Our headquarters in the heart of this region gives you exclusive access to the richest 'Illama' (gem-bearing gravel) deposits that standard tour operators cannot reach.
            </p>
          </div>
           <div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-lg">
              <Image
                src="https://picsum.photos/seed/ratnapura-gems/600/450"
                alt="A collection of rough, uncut sapphires from the Ratnapura region."
                data-ai-hint="rough sapphires"
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
