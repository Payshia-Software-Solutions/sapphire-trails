import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AboutHero } from '@/components/sections/about-hero';
import { OurStory } from '@/components/sections/our-story';
import { TeamSection } from '@/components/sections/team-section';

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
