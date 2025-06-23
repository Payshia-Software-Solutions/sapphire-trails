import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ToursHero } from '@/components/sections/tours-hero';
import { TourCards } from '@/components/sections/tour-cards';
import { ComparisonTable } from '@/components/sections/comparison-table';
import { Faq } from '@/components/sections/faq';

export default function ToursPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 bg-background-alt">
        <ToursHero />
        <TourCards />
        <ComparisonTable />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
