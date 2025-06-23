import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

export function VirtualTourContent() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl">Step Inside the Mine</h2>
          <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
            Click the play button to begin your immersive 360° virtual tour of a working sapphire mine. Pan around to see the environment and discover the secrets hidden within the earth.
          </p>
        </div>
        <div className="max-w-5xl mx-auto rounded-lg overflow-hidden border border-border shadow-lg relative">
          <Image
            src="https://placehold.co/1200x700.png"
            alt="A 360-degree view of the inside of a gem mine."
            data-ai-hint="mine interior panorama"
            width={1200}
            height={700}
            className="w-full h-auto"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/20 hover:text-white h-20 w-20 rounded-full p-0">
                <Play className="h-10 w-10 fill-white"/>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
