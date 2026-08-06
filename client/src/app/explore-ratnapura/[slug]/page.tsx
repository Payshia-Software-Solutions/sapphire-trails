
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
import { TrustSection } from '@/components/sections/TrustSection';

import { API_BASE_URL } from '@/lib/utils';

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
    title: `Explore ${location.title} | Ratnapura Gem Tour Attraction`,
    description: `Explore ${location.title} on your gem tour of Ratnapura, Sri Lanka. ${location.cardDescription}`,
    alternates: {
      canonical: `/explore-ratnapura/${params.slug}`,
    },
    openGraph: {
      title: `Explore ${location.title} | Attractions for Gem Tours in Sri Lanka`,
      description: `A must-see attraction for your Sri Lanka gem tour experience. ${location.cardDescription}`,
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

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://sapphiretrails.lk"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Explore Ratnapura",
        "item": "https://sapphiretrails.lk/explore-ratnapura"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": location.title,
        "item": `https://sapphiretrails.lk/explore-ratnapura/${params.slug}`
      }
    ]
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
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
      <TrustSection />
      <Footer />
    </div>
  );
}
