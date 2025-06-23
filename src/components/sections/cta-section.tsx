import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section id="cta" className="w-full py-12 md:py-24 lg:py-32 bg-card">
      <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-headline font-bold tracking-tighter md:text-4xl/tight">
            Ready to Ignite Your Online Presence?
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Don't wait to create the landing page you've always wanted. Get started with Landing Spark today and see the difference AI can make.
          </p>
        </div>
        <div className="mx-auto w-full max-w-sm space-y-2">
           <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="#contact">Start Your Free Trial</Link>
           </Button>
        </div>
      </div>
    </section>
  );
}
