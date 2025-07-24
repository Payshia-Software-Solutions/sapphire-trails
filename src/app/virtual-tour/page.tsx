import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { VirtualTourHero } from '@/components/sections/virtual-tour-hero';
import { VirtualTourContent } from '@/components/sections/virtual-tour-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Virtual Tour',
  description: 'Experience the thrill of a gem mine from anywhere in the world. Our immersive virtual tour is coming soon.',
  openGraph: {
    title: 'Virtual Tour of a Sri Lankan Gem Mine',
    description: 'Coming soon: an immersive 360-degree experience from Sapphire Trails.',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
      width: 1200,
      height: 630,
      alt: 'A dark and moody image of the inside of a gem mine.'
    }],
  }
};


export default function VirtualTourPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 bg-background-alt">
        <VirtualTourHero />
        <VirtualTourContent />
      </main>
      <Footer />
    </div>
  );
}
