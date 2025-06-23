import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BookingHero } from '@/components/sections/booking-hero';
import { BookingForm } from '@/components/sections/booking-form';

export default function BookingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <BookingHero />
        <BookingForm />
      </main>
      <Footer />
    </div>
  );
}
