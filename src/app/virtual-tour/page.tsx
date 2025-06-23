import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { VirtualTourHero } from '@/components/sections/virtual-tour-hero';
import { VirtualTourContent } from '@/components/sections/virtual-tour-content';
import { BookingSection } from '@/components/sections/booking-section';

export default function VirtualTourPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 bg-background-alt">
        <VirtualTourHero />
        <VirtualTourContent />
        <BookingSection />
      </main>
      <Footer />
    </div>
  );
}
