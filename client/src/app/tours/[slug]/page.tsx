
import { notFound, permanentRedirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { mapServerPackageToClient, type TourPackage } from '@/lib/packages-data';
import { TourDetailHero } from '@/components/sections/tour-detail-hero';
import { TourDetailNav } from '@/components/sections/tour-detail-nav';
import { TourDetailHighlights } from '@/components/sections/tour-detail-highlights';
import { TourDetailInclusions } from '@/components/sections/tour-detail-inclusions';
import { TourDetailItinerary } from '@/components/sections/tour-detail-itinerary';
import { TourFloatingBar } from '@/components/sections/tour-floating-bar';
import { TourExperienceGallery } from '@/components/sections/tour-experience-gallery';
import type { Metadata, ResolvingMetadata } from 'next';
import { TrustSection } from '@/components/sections/TrustSection';

import { API_BASE_URL } from '@/lib/utils';
const BASE_URL = 'https://sapphiretrails.lk';

export const revalidate = 3600;
export const dynamicParams = true;

// Map legacy tour slugs to canonical ones to maintain Google SEO equity and eliminate Search Console errors
const LEGACY_TOUR_SLUG_MAP: Record<string, string> = {
  'exclusive-sapphire-mine-tour-with-hands-on-discover': 'exclusive-gem-mine-tour-hands-on-discovery',
  'exclusive-sapphire-mine-tour': 'exclusive-gem-mine-tour-hands-on-discovery',
};

export async function generateStaticParams() {
  try {
    const response = await fetch(`${API_BASE_URL}/tours`, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    const data = await response.json();
    if (Array.isArray(data)) {
      return data
        .filter((pkg: any) => Boolean(pkg.slug))
        .map((pkg: any) => ({
          slug: pkg.slug,
        }));
    }
  } catch (error) {
    console.error('[generateStaticParams] Failed to fetch tour packages:', error);
  }
  return [];
}

async function getTourPackage(slug: string): Promise<TourPackage | null> {
    const url = `${API_BASE_URL}/tours/slug/${slug}/`;
    try {
        const response = await fetch(url, {
            next: { revalidate: 3600 },
            headers: {
                'Accept': 'application/json',
            },
        });
        if (!response.ok) {
            console.error(`[getTourPackage] Failed to fetch slug "${slug}" from ${url}. Status: ${response.status} ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        if (!data || data.error) {
            console.warn(`[getTourPackage] Tour package not found for slug "${slug}":`, data?.error || 'Empty data');
            return null;
        }
        return mapServerPackageToClient(data);
    } catch (error: any) {
        console.error(`[getTourPackage] Network/Fetch error for slug "${slug}" from ${url}:`, error?.message || error);
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
  if (LEGACY_TOUR_SLUG_MAP[slug]) {
    permanentRedirect(`/tours/${LEGACY_TOUR_SLUG_MAP[slug]}`);
  }
  const tourPackage = await getTourPackage(slug);

  if (!tourPackage) {
    return {
      title: 'Tour Not Found',
    }
  }

  const previousImages = (await parent).openGraph?.images || []

  const metaTitle = tourPackage.metaTitle?.trim() 
    ? tourPackage.metaTitle 
    : `Book the ${tourPackage.tourPageTitle} | Ratnapura Gem Mine Tours`;

  const metaDescription = tourPackage.metaDescription?.trim()
    ? tourPackage.metaDescription
    : `Experience one of the best gem tours in Ratnapura. Our ${tourPackage.tourPageTitle} is a private gem tour package offering an unforgettable Sri Lankan adventure. ${tourPackage.tourPageDescription}`;

  const canonical = tourPackage.canonicalUrl?.trim()
    ? tourPackage.canonicalUrl
    : `/tours/${slug}`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: tourPackage.metaKeywords ? tourPackage.metaKeywords.split(',').map(k => k.trim()) : undefined,
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      images: [
        {
          url: tourPackage.heroImage,
          width: 1200,
          height: 630,
          alt: tourPackage.tourPageTitle,
        },
        ...previousImages,
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [tourPackage.heroImage],
    }
  }
}


export default async function TourDetailPage({ params }: Props) {
  const { slug } = await params;
  if (LEGACY_TOUR_SLUG_MAP[slug]) {
    permanentRedirect(`/tours/${LEGACY_TOUR_SLUG_MAP[slug]}`);
  }
  const tourPackage = await getTourPackage(slug);

  if (!tourPackage || !tourPackage.tourPageTitle) {
    notFound();
  }

  const rawPrice = (tourPackage.price || '').replace(/[^0-9.]/g, '');
  const displayPrice = rawPrice && !isNaN(Number(rawPrice)) && Number(rawPrice) > 0 ? rawPrice : '45.00';
  const bookingUrl = tourPackage.id && !isNaN(Number(tourPackage.id))
    ? `${BASE_URL}${tourPackage.bookingLink}?tourType=${tourPackage.id}`
    : `${BASE_URL}/tours/${slug}`;

  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": tourPackage.tourPageTitle || tourPackage.homepageTitle || "Ratnapura Gem Mine Tour",
    "description": tourPackage.tourPageDescription || tourPackage.homepageDescription || "Authentic gem mine tour experience in Ratnapura Sri Lanka with Sapphire Trails.",
    "image": [tourPackage.heroImage || tourPackage.imageUrl || "https://content-provider.payshia.com/sapphire-trail/images/tour-1.webp"],
    "sku": `ST-TOUR-${tourPackage.id && !isNaN(Number(tourPackage.id)) ? tourPackage.id : slug}`,
    "url": `${BASE_URL}/tours/${slug}`,
    "brand": {
      "@type": "Brand",
      "name": "Sapphire Trails"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": displayPrice,
      "availability": "https://schema.org/InStock",
      "url": bookingUrl
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "124",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  const touristTripStructuredData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": tourPackage.tourPageTitle,
    "description": tourPackage.tourPageDescription,
    "image": tourPackage.heroImage,
    "touristType": ["EcoTourism", "LuxuryTourism", "GemstoneTourism"],
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": tourPackage.price.replace(/[^0-9.]/g, ''),
      "availability": "https://schema.org/InStock",
      "url": `${BASE_URL}${tourPackage.bookingLink}?tourType=${tourPackage.id}`
    },
    "provider": {
      "@type": "TravelAgency",
      "name": "Sapphire Trails Sri Lanka",
      "url": "https://sapphiretrails.lk"
    }
  };

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
        "name": "Tours",
        "item": "https://sapphiretrails.lk/tours"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": tourPackage.tourPageTitle,
        "item": `https://sapphiretrails.lk/tours/${slug}`
      }
    ]
  };

  const tiers = tourPackage.pricingTiers || [];
  const hasTiers = tiers.length > 0;
  const perPersonTiers = tiers.filter(t => t.pricing_type === 'per_person');
  const lowestTierPrice = perPersonTiers.length > 0 ? Math.min(...perPersonTiers.map(t => t.price)) : null;
  const displayNavPrice = hasTiers && lowestTierPrice !== null ? `$${lowestTierPrice}` : tourPackage.price;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
      />
      <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(touristTripStructuredData) }}
      />
      <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <Header />
      <main className="flex-1">
        <TourDetailHero
            title={tourPackage.tourPageTitle}
            duration={tourPackage.duration}
            price={tourPackage.price}
            priceSuffix={tourPackage.priceSuffix}
            pricingTiers={tourPackage.pricingTiers}
            imageUrl={tourPackage.heroImage || tourPackage.imageUrl}
            imageHint={tourPackage.heroImageHint}
            bookingLink={`/tours/${slug}/book`}
            galleryImages={tourPackage.experienceGallery}
            inclusions={tourPackage.inclusions}
            category="Gem Mine Tours"
        />
        <TourDetailNav
            tourTitle={tourPackage.tourPageTitle}
            price={displayNavPrice}
            bookingLink={`/tours/${slug}/book`}
        />
        <TourDetailHighlights 
            description={tourPackage.tourPageDescription}
            highlights={tourPackage.tourHighlights}
        />
        {/* Itinerary + Inclusions side by side on desktop */}
        <section className="w-full py-16 sm:py-24 bg-background-alt border-b border-border/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <TourDetailItinerary itinerary={tourPackage.itinerary} />
              <TourDetailInclusions
                inclusions={tourPackage.inclusions.map(i => i.title)}
              />
            </div>
          </div>
        </section>
        <TourExperienceGallery images={tourPackage.experienceGallery} />
        <TourFloatingBar
            price={tourPackage.price}
            priceSuffix={tourPackage.priceSuffix}
            duration={tourPackage.duration}
            bookingLink={`/tours/${slug}/book`}
            pricingTiers={tourPackage.pricingTiers}
        />
      </main>
      <TrustSection />
      <Footer />
    </div>
  );
}
