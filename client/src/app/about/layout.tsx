import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Sapphire Trails | Premier Sri Lanka Gem Mine Tour Operators',
  description: 'Learn about Sapphire Trails, the leading provider of ethical, luxury gem mine tours in Ratnapura (Rathnapura), Sri Lanka. Certified gemologists, active mine access, and hospitality excellence.',
  keywords: [
    'about Sapphire Trails',
    'Sri Lanka gem mine tour operators',
    'Ratnapura gem tours',
    'Rathnapura mining tours',
    'Sri Lankan gem tours',
    'ethical gem mining Sri Lanka'
  ],
  alternates: {
    canonical: 'https://sapphiretrails.lk/about',
  },
  openGraph: {
    title: 'About Sapphire Trails | Premier Sri Lanka Gem Mine Tour Operators',
    description: 'Learn about Sapphire Trails, providing ethical, luxury gem mine tours in Ratnapura, Sri Lanka.',
    url: 'https://sapphiretrails.lk/about',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
      width: 1200,
      height: 630,
      alt: 'About Sapphire Trails Sri Lanka Gem Tours',
    }],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
