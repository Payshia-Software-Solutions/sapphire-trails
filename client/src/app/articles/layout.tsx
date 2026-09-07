import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gemology & Expedition Journal | Sri Lanka Gem Mine Tour Guides',
  description: 'Read authoritative guides on Ceylon sapphires, traditional gem mining in Ratnapura (Rathnapura), gem market secrets, and planning your Sri Lankan gem tour.',
  keywords: [
    'gem mine tours',
    'gem mining tour Sri Lanka',
    'Ratnapura gem guide',
    'Rathnapura gems',
    'Ceylon sapphire guides',
    'Sri Lankan gem tours',
    'gem market trading Ratnapura'
  ],
  alternates: {
    canonical: 'https://sapphiretrails.lk/articles',
  },
  openGraph: {
    title: 'Gemology & Expedition Journal | Sapphire Trails',
    description: 'Guides on Ceylon sapphires, Ratnapura gem mines, market trading, and tour planning in Sri Lanka.',
    url: 'https://sapphiretrails.lk/articles',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img37.webp',
      width: 1200,
      height: 630,
      alt: 'Gemology and Gem Tour Guides - Sapphire Trails',
    }],
  },
};

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
