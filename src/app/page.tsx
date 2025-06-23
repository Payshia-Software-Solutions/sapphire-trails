import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { CtaSection } from '@/components/sections/cta-section';
import { ContactSection } from '@/components/sections/contact-section';
import { ScrollAnimate } from '@/components/shared/scroll-animate';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />

        <ScrollAnimate>
          <TestimonialsSection />
        </ScrollAnimate>

        <ScrollAnimate>
          <CtaSection />
        </ScrollAnimate>
        
        <ScrollAnimate>
          <ContactSection />
        </ScrollAnimate>
      </main>
      <Footer />
    </div>
  );
}
