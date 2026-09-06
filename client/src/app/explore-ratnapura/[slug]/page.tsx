
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { mapServerLocationToClient, type Location } from '@/lib/locations-data';
import { LocationHero } from '@/components/sections/location-hero';
import { LocationNav } from '@/components/sections/location-nav';
import { LocationIntro } from '@/components/sections/location-intro';
import { LocationGallery } from '@/components/sections/location-gallery';
import { LocationExperienceGuide } from '@/components/sections/location-experience-guide';
import { LocationNearby } from '@/components/sections/location-nearby';
import { LocationCta } from '@/components/sections/location-cta';
import type { Metadata, ResolvingMetadata } from 'next';
import { TrustSection } from '@/components/sections/TrustSection';

import { API_BASE_URL } from '@/lib/utils';

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const response = await fetch(`${API_BASE_URL}/locations/`, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    const data = await response.json();
    if (Array.isArray(data)) {
      return data
        .filter((loc: any) => Boolean(loc.slug))
        .map((loc: any) => ({
          slug: loc.slug,
        }));
    }
  } catch (error) {
    console.error('[generateStaticParams] Failed to fetch locations:', error);
  }
  return [];
}

async function getLocation(slug: string): Promise<Location | null> {
    const url = `${API_BASE_URL}/locations/${slug}`;
    try {
        const response = await fetch(url, {
            next: { revalidate: 3600 },
            headers: {
                'Accept': 'application/json',
            },
        });
        if (!response.ok) {
            console.error(`[getLocation] Failed to fetch location "${slug}" from ${url}. Status: ${response.status} ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        if (!data || data.error) {
            console.warn(`[getLocation] Location not found for slug "${slug}":`, data?.error || 'Empty data');
            return null;
        }
        return mapServerLocationToClient(data);
    } catch (error: any) {
        console.error(`[getLocation] Network/Fetch error for slug "${slug}" from ${url}:`, error?.message || error);
        return null;
    }
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const location = await getLocation(slug);

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
      canonical: `/explore-ratnapura/${slug}`,
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
  const { slug } = await params;
  const location = await getLocation(slug);

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
        "item": `https://sapphiretrails.lk/explore-ratnapura/${slug}`
      }
    ]
  };

  const touristAttractionStructuredData = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "name": location.title,
    "description": location.cardDescription || location.intro.description,
    "image": location.heroImage,
    "url": `https://sapphiretrails.lk/explore-ratnapura/${slug}`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Ratnapura",
      "addressRegion": "Sabaragamuwa Province",
      "addressCountry": "LK"
    },
    "touristType": ["EcoTourism", "CulturalTourism", "GemstoneTourism"]
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(touristAttractionStructuredData) }}
      />
      <Header />
      <main className="flex-1">
        <LocationHero
          title={location.title}
          subtitle={location.subtitle}
          imageUrl={location.heroImage}
          imageHint={location.heroImageHint}
          distance={location.distance}
          category={location.category}
        />
        <LocationNav locationTitle={location.title} />
        <LocationIntro
          distance={location.distance}
          title={location.intro.title}
          description={location.intro.description}
          imageUrl={location.intro.imageUrl}
          imageHint={location.intro.imageHint}
        />
        <LocationExperienceGuide 
          highlights={location.highlights} 
          visitorInfo={location.visitorInfo} 
        />
        <LocationGallery images={location.galleryImages} />
        <LocationNearby
          currentLocationTitle={location.title}
          currentLocationImage={location.cardImage || location.heroImage || location.intro.imageUrl}
          mapEmbedUrl={location.map.embedUrl}
          nearbyAttractions={location.map.nearbyAttractions}
        />
        <LocationCta locationTitle={location.title} />
      </main>
      <TrustSection />
      <Footer />
    </div>
  );
}
