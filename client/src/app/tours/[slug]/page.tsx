
import { notFound } from 'next/navigation';
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

async function getTourPackage(slug: string): Promise<TourPackage | null> {
    const url = `${API_BASE_URL}/tours/slug/${slug}/`;
    try {
        const response = await fetch(url, {
            cache: 'no-store',
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
  const tourPackage = await getTourPackage(slug);

  if (!tourPackage) {
    notFound();
  }

  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": tourPackage.tourPageTitle,
    "description": tourPackage.tourPageDescription,
    "image": tourPackage.heroImage,
    "brand": {
      "@type": "Brand",
      "name": "Sapphire Trails"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": tourPackage.price.replace(/[^0-9.]/g, ''),
      "availability": "https://schema.org/InStock",
      "url": `${BASE_URL}${tourPackage.bookingLink}?tourType=${tourPackage.id}`
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "89"
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
            imageUrl={tourPackage.heroImage || tourPackage.imageUrl}
            imageHint={tourPackage.heroImageHint}
            bookingLink={`/tours/${slug}/book`}
            galleryImages={tourPackage.experienceGallery}
        />
        <TourDetailNav
            tourTitle={tourPackage.tourPageTitle}
            price={tourPackage.price}
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
        />
      </main>
      <TrustSection />
      <Footer />
    </div>
  );
}
