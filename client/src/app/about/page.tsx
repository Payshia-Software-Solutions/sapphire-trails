
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { OurStory } from '@/components/sections/our-story';
import { TeamSection } from '@/components/sections/team-section';
import type { Metadata } from 'next';
import { ExperienceSection } from '@/components/sections/experience-section';
import { PageHero } from '@/components/shared/page-hero';
import { EthicalMiningSection } from '@/components/sections/EthicalMiningSection';
import { SafetyStandardsSection } from '@/components/sections/SafetyStandardsSection';
import { WhyRatnapuraSection } from '@/components/sections/WhyRatnapuraSection';
import { AboutCtaSection } from '@/components/sections/AboutCtaSection';
import { TrustSection } from '@/components/sections/TrustSection';

export const metadata: Metadata = {
  title: 'About Sapphire Trails | Ethical & Safe Sri Lanka Gem Tours',
  description: 'Learn about our commitment to ethical gem mining, our safety standards, and why Ratnapura is the heart of the gem world. Discover the experts behind Sri Lanka\'s premier gem tours.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Sapphire Trails | Ethical & Safe Gem Tours in Sri Lanka',
    description: 'Learn about the experts behind Sri Lanka\'s premier gem tours, our commitment to ethical mining, and our high safety standards.',
    images: [{
      url: 'https://content-provider.payshia.com/sapphire-trail/images/img31.webp',
      width: 1200,
      height: 630,
      alt: 'Exterior of Grand Silver Ray resort, accommodation for our Sri Lanka gem tours.'
    }],
  }
};


export default function AboutPage() {
  const breadcrumbs = [{ label: 'About Us', href: '/about' }];
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PageHero title="About Us" breadcrumbs={breadcrumbs} />
        <OurStory />
        <ExperienceSection />
        <TeamSection />
        <EthicalMiningSection />
        <SafetyStandardsSection />
        <WhyRatnapuraSection />
        <AboutCtaSection />
      </main>
      <TrustSection />
      <Footer />
    </div>
  );
}
