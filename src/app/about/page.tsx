import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AboutHero } from '@/components/sections/about-hero';
import { OurStory } from '@/components/sections/our-story';
import { TeamSection } from '@/components/sections/team-section';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about the story, mission, and team behind Sapphire Trails, Sri Lanka\'s premier luxury gem and cultural experience.',
  openGraph: {
    title: 'About Sapphire Trails',
    description: 'Discover the heritage and passion behind Sri Lanka\'s most exclusive gem tour.',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img31.webp',
      width: 1200,
      height: 630,
      alt: 'The exterior of the Grand Silver Ray resort building.'
    }],
  }
};


export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 bg-background-alt">
        <AboutHero />
        <OurStory />
        <TeamSection />
      </main>
      <Footer />
    </div>
  );
}
