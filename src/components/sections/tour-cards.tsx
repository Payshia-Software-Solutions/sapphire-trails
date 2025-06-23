import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Gem, Landmark, Award, Utensils, Star, Package, Coffee, BedDouble } from 'lucide-react';

export function TourCards() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          
          <Card className="bg-card border-stone-800/50 flex flex-col w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
            <div className="relative h-[400px] w-full">
              <Image
                src="https://placehold.co/600x400.png"
                alt="A group of smiling tourists wearing hard hats on a sapphire mine tour."
                data-ai-hint="tourists mining gems"
                layout="fill"
                objectFit="cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center text-white font-headline w-full px-4">
                <p className="text-sm tracking-[0.2em]">GEM EXPLORER</p>
                <h3 className="text-6xl font-bold tracking-tight my-2">GEM XPLOR</h3>
                <p className="text-2xl tracking-[0.1em]">DAY TOUR</p>
              </div>
            </div>
            <CardContent className="p-8 flex flex-col flex-grow">
              <div className="space-y-3 flex-grow text-sm text-muted-foreground">
                <div className="flex items-start gap-3"><MapPin className="h-4 w-4 mt-1 text-primary shrink-0" /><span>GUIDED MINE TOUR</span></div>
                <div className="flex items-start gap-3"><Gem className="h-4 w-4 mt-1 text-primary shrink-0" /><span>Gem market tour</span></div>
                <div className="flex items-start gap-3"><Gem className="h-4 w-4 mt-1 text-primary shrink-0" /><span>Traditional & Modern Gem cutting tour</span></div>
                <div className="flex items-start gap-3"><Landmark className="h-4 w-4 mt-1 text-primary shrink-0" /><span>Gem museum visit</span></div>
                <div className="flex items-start gap-3"><Award className="h-4 w-4 mt-1 text-primary shrink-0" /><span>Gem Showcase from premium vendors</span></div>
                <div className="flex items-start gap-3"><Utensils className="h-4 w-4 mt-1 text-primary shrink-0" /><span>SNACK AT THE MINE LUNCH AT GRAND SILVER RAY</span></div>
              </div>
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
                <p className="text-3xl font-bold text-primary">$135 <span className="text-sm font-normal text-muted-foreground">per person</span></p>
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-8"><Link href="/contact">Book Now</Link></Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-stone-800/50 flex flex-col w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
            <div className="relative h-[400px] w-full bg-[#0a2823] flex items-center justify-center p-8" data-ai-hint="luxury gem logo">
              <div className="text-center text-white font-headline">
                 <svg viewBox="0 0 128 106" className="w-24 h-24 mx-auto text-primary" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1">
                    <path d="M64 105.5L0.5 38L64 0.5L127.5 38L64 105.5Z"/>
                    <path d="M0.5 38H127.5"/>
                    <path d="M32 38L64 71L96 38"/>
                    <path d="M64 105.5V0.5"/>
                    <path d="M48 38C52.6667 30.1667 71.8 28.6 80 38"/>
                    <path d="M56 38C59.3333 32.5 68.2 31.4 72 38"/>
                </svg>
                <h3 className="text-4xl tracking-[0.2em] mt-4">SAPPHIRE TRAILS</h3>
                <div className="flex items-center justify-center gap-4 my-2">
                  <div className="h-px w-12 bg-primary/50"></div>
                  <p className="text-xl tracking-[0.1em] text-primary">DELUXE</p>
                  <div className="h-px w-12 bg-primary/50"></div>
                </div>
              </div>
            </div>
            <CardContent className="p-8 flex flex-col flex-grow">
              <div className="space-y-3 flex-grow text-sm text-muted-foreground">
                <div className="flex items-start gap-3"><Star className="h-4 w-4 mt-1 text-primary shrink-0" /><span>Includes everything from the Gem Explorer Tour</span></div>
                <div className="flex items-start gap-3"><Package className="h-4 w-4 mt-1 text-primary shrink-0" /><span>GEM EXPLORER TOUR</span></div>
                <div className="flex items-start gap-3"><Coffee className="h-4 w-4 mt-1 text-primary shrink-0" /><span>TEA FACTORY TOUR & TEA TASTING SESSION</span></div>
                <div className="flex items-start gap-3"><BedDouble className="h-4 w-4 mt-1 text-primary shrink-0" /><span>ONE NIGHT FULL BOARD STAY AT GRAND SILVER RAY</span></div>
              </div>
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
                <p className="text-3xl font-bold text-primary">$215 <span className="text-sm font-normal text-muted-foreground">per person</span></p>
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-8"><Link href="/contact">Book Now</Link></Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  );
}
