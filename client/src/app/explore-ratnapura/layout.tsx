import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Ratnapura (Rathnapura) | City of Gems Travel Guide',
  description: 'Discover Ratnapura (Rathnapura), the gemstone capital of Sri Lanka. Explore traditional gem markets, gem pits, tea estates, waterfalls, and cultural landmarks with Sapphire Trails.',
  keywords: [
    'Explore Ratnapura',
    'Rathnapura City of Gems',
    'Ratnapura gem market',
    'Gem mining Rathnapura',
    'Sri Lanka gem tours',
    'things to do in Ratnapura',
    'Ratnapura attractions'
  ],
  alternates: {
    canonical: 'https://sapphiretrails.lk/explore-ratnapura',
  },
  openGraph: {
    title: 'Explore Ratnapura (Rathnapura) | City of Gems Travel Guide',
    description: 'Discover Ratnapura, the gemstone capital of Sri Lanka. Authentic gem mines, street bazaars, waterfalls, and heritage trails.',
    url: 'https://sapphiretrails.lk/explore-ratnapura',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp',
      width: 1200,
      height: 630,
      alt: 'Explore Ratnapura City of Gems - Sapphire Trails',
    }],
  },
};

export default function ExploreRatnapuraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
