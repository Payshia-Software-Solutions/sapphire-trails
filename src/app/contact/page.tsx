
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ContactSection } from '@/components/sections/contact-section';
import type { Metadata } from 'next';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import { PageHero } from '@/components/shared/page-hero';

export const metadata: Metadata = {
  title: 'Contact Us | Book Your Sri Lanka Gem Tour & Experience',
  description: 'Contact Sapphire Trails to book your gem tour in Ratnapura, Sri Lanka. We\'re here to help you plan your luxury Sri Lankan gem tour experience.',
  openGraph: {
    title: 'Contact Sapphire Trails to Book a Gem Tour in Sri Lanka',
    description: 'Have questions about our Sri Lanka gem tours or gem experiences? We are here to help.',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
      width: 1200,
      height: 630,
      alt: 'A dark and moody image of the inside of a gem mine in Ratnapura.'
    }],
  }
};

export default function ContactPage() {
  const breadcrumbs = [{ label: 'Contact', href: '/contact' }];
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <PageHero title="Contact Us" breadcrumbs={breadcrumbs} />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
