import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollAnimate } from '@/components/shared/scroll-animate';

export function SubscriptionSection() {
  return (
    <section id="subscribe" className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6 mx-auto">
        <ScrollAnimate className="mx-auto flex flex-col items-center justify-center gap-6 text-center max-w-2xl">
          <div className="space-y-4">
            <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl">
              Stay in the Loop
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              Subscribe to our newsletter to receive the latest updates, special offers, and exclusive insights into the world of Sapphire Trails.
            </p>
          </div>
          <div className="w-full max-w-md">
            <form className="flex space-x-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="max-w-lg flex-1 bg-background-alt border-border"
                aria-label="Email for newsletter"
              />
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Subscribe
              </Button>
            </form>
          </div>
        </ScrollAnimate>
      </div>
    </section>
  );
}
