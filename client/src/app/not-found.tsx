import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Gem, Compass, Home } from 'lucide-react';
import { TrustSection } from '@/components/sections/TrustSection';
import { ToursSection } from '@/components/sections/tours-section';
import { fetchTourPackages } from '@/lib/packages-data';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Sapphire Trails',
  description: 'The requested page was not found. Explore our signature gem mine tours and packages in Ratnapura, Sri Lanka.',
};

export default async function NotFound() {
  const tours = await fetchTourPackages(3600);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Friendly 404 Hero Notice */}
        <section className="w-full bg-background-alt border-b border-border/70 py-12 md:py-16 text-center">
          <div className="container mx-auto px-4 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1E38]/5 dark:bg-white/5 border border-[#0B1E38]/15 dark:border-white/15 text-xs font-semibold uppercase tracking-wider text-[#0B1E38] dark:text-blue-300 shadow-2xs font-sans">
              <Gem className="h-3.5 w-3.5" />
              <span>404 Error • Page Not Found</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-sans tracking-tight text-foreground">
              Looks Like You’ve Wandered Off The Trail
            </h1>
            
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-sans">
              The page you are looking for does not exist or has been moved. While you are here, explore our signature Ceylon sapphire mine tours below:
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button asChild className="bg-[#0B1E38] hover:bg-[#071527] text-white rounded-full px-6 h-10 sm:h-11 shadow-sm text-xs sm:text-sm font-medium border border-[#0B1E38]">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Homepage
                </Link>
              </Button>

              <Button asChild variant="outline" className="rounded-full px-6 h-10 sm:h-11 text-xs sm:text-sm font-medium border-border hover:border-[#0B1E38] bg-background hover:bg-background-alt">
                <Link href="/tours">
                  <Compass className="mr-2 h-4 w-4" />
                  Explore All Tours
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Tour Packages to keep visitors engaged */}
        <ToursSection initialTours={tours} />
      </main>

      <TrustSection />
      <Footer />
    </div>
  );
}
