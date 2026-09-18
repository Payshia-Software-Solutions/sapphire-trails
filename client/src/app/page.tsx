import { fetchTourPackages } from '@/lib/packages-data';
import { HomePageClient } from '@/components/sections/home-page-client';

export const revalidate = 60;

export default async function Home() {
  const tours = await fetchTourPackages(60);
  return <HomePageClient initialTours={tours} />;
}
