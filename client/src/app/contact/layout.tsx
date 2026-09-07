import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Sapphire Trails Sri Lanka Gem Tours',
  description: 'Get in touch with Sapphire Trails. Book your private Ratnapura gem mine tour, inquire about custom itineraries, or speak with our luxury concierge.',
  keywords: [
    'contact Sapphire Trails',
    'book gem mine tour',
    'Ratnapura gem tour booking',
    'Sri Lanka gem tour contact',
    'Grand Silver Ray Ratnapura'
  ],
  alternates: {
    canonical: 'https://sapphiretrails.lk/contact',
  },
  openGraph: {
    title: 'Contact Us | Sapphire Trails Sri Lanka Gem Tours',
    description: 'Book your private Ratnapura gem mine tour or consult our luxury travel concierge.',
    url: 'https://sapphiretrails.lk/contact',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
      width: 1200,
      height: 630,
      alt: 'Contact Sapphire Trails Sri Lanka',
    }],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
