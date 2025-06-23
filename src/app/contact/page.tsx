import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ContactHero } from '@/components/sections/contact-hero';
import { ContactSection } from '@/components/sections/contact-section';

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <ContactHero />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
