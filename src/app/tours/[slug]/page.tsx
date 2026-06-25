
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { mapServerPackageToClient, type TourPackage } from '@/lib/packages-data';
import { TourDetailHero } from '@/components/sections/tour-detail-hero';
import { TourDetailHighlights } from '@/components/sections/tour-detail-highlights';
import { TourDetailInclusions } from '@/components/sections/tour-detail-inclusions';
import { TourDetailItinerary } from '@/components/sections/tour-detail-itinerary';
import { TourFloatingBar } from '@/components/sections/tour-floating-bar';
import { TourExperienceGallery } from '@/components/sections/tour-experience-gallery';
import type { Metadata, ResolvingMetadata } from 'next';
import { TrustSection } from '@/components/sections/TrustSection';

const API_BASE_URL = 'https://server-sapphiretrails.payshia.com';
const BASE_URL = 'https://sapphiretrails.lk';

async function getTourPackage(slug: string): Promise<TourPackage | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/tours/slug/${slug}/`);
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        return mapServerPackageToClient(data);
    } catch (error) {
        console.error("Failed to fetch tour package by slug", error);
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
  const tourPackage = await getTourPackage(params.slug);

  if (!tourPackage) {
    return {
      title: 'Tour Not Found',
    }
  }

  const previousImages = (await parent).openGraph?.images || []

  return {
    title: `Book the ${tourPackage.tourPageTitle} | Ratnapura Gem Mine Tours`,
    description: `Experience one of the best gem tours in Ratnapura. Our ${tourPackage.tourPageTitle} is a private gem tour package offering an unforgettable Sri Lankan adventure. ${tourPackage.tourPageDescription}`,
    alternates: {
      canonical: `/tours/${params.slug}`,
    },
    openGraph: {
      title: `Book the ${tourPackage.tourPageTitle} | Ratnapura Gem Mine Tours`,
      description: `Experience one of the best private gem tours in Ratnapura, Sri Lanka with our ${tourPackage.tourPageTitle} package.`,
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
  }
}


export default async function TourDetailPage({ params }: Props) {
  const tourPackage = await getTourPackage(params.slug);

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
        "item": `https://sapphiretrails.lk/tours/${params.slug}`
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <Header />
      <main className="flex-1">
        <TourDetailHero
            title={tourPackage.tourPageTitle}
            duration={tourPackage.duration}
            price={tourPackage.price}
            priceSuffix={tourPackage.priceSuffix}
            imageUrl={tourPackage.heroImage}
            imageHint={tourPackage.heroImageHint}
            bookingLink={`${tourPackage.bookingLink}?tourType=${tourPackage.id}`}
        />
        <TourDetailHighlights 
            description={tourPackage.tourPageDescription}
            highlights={tourPackage.tourHighlights}
        />
        <TourDetailItinerary itinerary={tourPackage.itinerary} />
        <TourDetailInclusions
            inclusions={tourPackage.inclusions.map(i => i.title)}
        />
        <TourExperienceGallery images={tourPackage.experienceGallery} />
        <TourFloatingBar
            price={tourPackage.price}
            priceSuffix={tourPackage.priceSuffix}
            duration={tourPackage.duration}
            bookingLink={`${tourPackage.bookingLink}?tourType=${tourPackage.id}`}
        />
      </main>
      <TrustSection />
      <Footer />
    </div>
  );
}
