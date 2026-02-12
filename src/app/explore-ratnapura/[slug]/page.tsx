
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { mapServerLocationToClient, type Location } from '@/lib/locations-data';
import { LocationHero } from '@/components/sections/location-hero';
import { LocationIntro } from '@/components/sections/location-intro';
import { LocationGallery } from '@/components/sections/location-gallery';
import { LocationHighlights } from '@/components/sections/location-highlights';
import { LocationVisitorInfo } from '@/components/sections/location-visitor-info';
import { LocationNearby } from '@/components/sections/location-nearby';
import { LocationCta } from '@/components/sections/location-cta';
import type { Metadata, ResolvingMetadata } from 'next';

const API_BASE_URL = 'https://server-sapphiretrails.payshia.com';

async function getLocation(slug: string): Promise<Location | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/locations/${slug}`);
        if (response.ok) {
            const data = await response.json();
            return mapServerLocationToClient(data);
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch location", error);
        return null;
    }
}

type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const location = await getLocation(params.slug);

  if (!location) {
    return {
      title: 'Location Not Found',
    }
  }

  const previousImages = (await parent).openGraph?.images || []

  return {
    title: `${location.title} | Explore Ratnapura Gem Attractions`,
    description: location.cardDescription,
    openGraph: {
      title: `${location.title} | Attractions for Gem Tours in Sri Lanka`,
      description: location.cardDescription,
      images: [
        {
          url: location.heroImage,
          width: 1200,
          height: 630,
          alt: location.title,
        },
        ...previousImages,
      ],
    },
  }
}

export default async function LocationPage({ params }: Props) {
  const location = await getLocation(params.slug);

  if (!location) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <LocationHero
          title={location.title}
          subtitle={location.subtitle}
          imageUrl={location.heroImage}
          imageHint={location.heroImageHint}
        />
        <LocationIntro
          distance={location.distance}
          title={location.intro.title}
          description={location.intro.description}
          imageUrl={location.intro.imageUrl}
          imageHint={location.intro.imageHint}
        />
        <LocationGallery images={location.galleryImages} />
        <LocationHighlights highlights={location.highlights} />
        <LocationVisitorInfo visitorInfo={location.visitorInfo} />
        <LocationNearby
          mapEmbedUrl={location.map.embedUrl}
          nearbyAttractions={location.map.nearbyAttractions}
        />
        <LocationCta />
      </main>
      <Footer />
    </div>
  );
}
