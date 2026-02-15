
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

export function SafetyStandardsSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
           <div className="order-last md:order-first">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-lg">
              <Image
                src="https://content-provider.payshia.com/sapphire-trail/images/tour-6-optimized.webp"
                alt="A happy tourist gives a thumbs-up while wearing safety gear on a gem tour."
                data-ai-hint="tourist safety"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="space-y-4">
             <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
              <ShieldCheck className="mr-2 h-5 w-5" />
              Your Safety is Our Priority
            </div>
            <h2 className="text-3xl font-headline font-bold text-primary">Safety & Standards</h2>
            <p className="text-muted-foreground leading-relaxed">
             Your safety is our priority. Unlike informal visits, our curated gem mine tours are conducted under the supervision of industry professionals. We provide all necessary safety gear, including helmets and boots, and ensure comfortable access to active pits. As a division of the Grand Silver Ray Hotel, we maintain international hospitality standards throughout your adventure.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
