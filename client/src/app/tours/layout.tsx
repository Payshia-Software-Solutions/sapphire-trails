import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gem Mine Tours in Ratnapura | Sri Lankan Gem Mining Packages',
  description: 'Book authentic gem mine tours in Ratnapura (Rathnapura), Sri Lanka. Explore active subterranean mining pits, traditional river illam washing, and exclusive Sri Lankan gem tour packages with Sapphire Trails.',
  keywords: [
    'gem mine tours',
    'gem mining tour',
    'Gem tours',
    'gem mine tours rathnapura',
    'srilankan gem tours',
    'sri lanka gem mine tour',
    'Gem mining Rathnapura',
    'Ratnapura gem tours',
    'Ceylon sapphire mining tour',
    'Sri Lanka gem expedition'
  ],
  alternates: {
    canonical: 'https://sapphiretrails.lk/tours',
  },
  openGraph: {
    title: 'Gem Mine Tours in Ratnapura | Sri Lankan Gem Mining Packages',
    description: 'Book authentic gem mine tours in Ratnapura (Rathnapura), Sri Lanka. Active pit descent, river washing, and private gemologist expeditions.',
    url: 'https://sapphiretrails.lk/tours',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/tour-3-optimized.webp',
      width: 1200,
      height: 630,
      alt: 'Gem Mine Tours in Ratnapura Sri Lanka - Sapphire Trails',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gem Mine Tours in Ratnapura | Sri Lankan Gem Mining Packages',
    description: 'Book authentic gem mine tours in Ratnapura (Rathnapura), Sri Lanka with Sapphire Trails.',
    images: ['https://content-provider.payshia.com/sapphire-trail/images/tour-3-optimized.webp'],
  }
};

export default function ToursLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
