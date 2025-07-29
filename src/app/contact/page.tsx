import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ContactHero } from '@/components/sections/contact-hero';
import { ContactSection } from '@/components/sections/contact-section';
import type { Metadata } from 'next';
import { ScrollAnimate } from '@/components/shared/scroll-animate';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Sapphire Trails team. We are here to answer your questions and help you plan your luxury gem tour experience in Sri Lanka.',
  openGraph: {
    title: 'Contact Sapphire Trails',
    description: 'Have questions? We are here to help.',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
      width: 1200,
      height: 630,
      alt: 'A dark and moody image of the inside of a gem mine.'
    }],
  }
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <ContactHero />
        <ScrollAnimate>
          <ContactSection />
        </ScrollAnimate>
      </main>
      <Footer />
    </div>
  );
}
