import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Suspense } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import { BookingPageContent } from '@/components/sections/booking-page-content';
import { TrustSection } from '@/components/sections/TrustSection';
import { mapServerPackageToClient, type TourPackage } from '@/lib/packages-data';
import { API_BASE_URL } from '@/lib/utils';

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
            console.error(`[Booking.getTourPackage] Failed to fetch slug "${slug}" from ${url}. Status: ${response.status} ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        if (!data || data.error) {
            console.warn(`[Booking.getTourPackage] Tour package not found for slug "${slug}":`, data?.error || 'Empty data');
            return null;
        }
        return mapServerPackageToClient(data);
    } catch (error: any) {
        console.error(`[Booking.getTourPackage] Network/Fetch error for slug "${slug}" from ${url}:`, error?.message || error);
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
      title: 'Book Tour',
    }
  }

  return {
    title: `Book ${tourPackage.tourPageTitle} | Sapphire Trails`,
    description: `Book your ${tourPackage.tourPageTitle} gem tour package. Reserve your luxury mining experience in Ratnapura, Sri Lanka.`,
  }
}

export default async function BookingPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center">
            <p>Loading...</p>
          </div>
        }>
          <BookingPageContent tourSlug={slug} />
        </Suspense>
      </main>
      <TrustSection />
      <Footer />
    </div>
  );
}
