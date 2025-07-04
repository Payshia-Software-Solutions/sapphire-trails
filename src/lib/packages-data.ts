
import { type LucideIcon, MapPin, Gem, Landmark, Award, Utensils, Star, Package, Coffee, BedDouble, Users, Mountain } from 'lucide-react';

export interface TourFeature {
  icon: LucideIcon;
  text: string;
}

export interface TourHighlight {
  icon: string;
  title: string;
  description: string;
}

export interface ItineraryItem {
  time: string;
  title: string;
  description: string;
}

export interface TourPackage {
    id: number; // slug
    
    // Homepage & Tour Grid
    imageUrl: string;
    imageAlt: string;
    imageHint: string;
    homepageTitle: string; 
    homepageDescription: string;
    
    // Tour Detail Page
    tourPageTitle: string;
    duration: string;
    price: string;
    priceSuffix: string;
    heroImage: string;
    heroImageHint: string;
    tourPageDescription: string;
    tourHighlights: TourHighlight[];
    inclusions: string[];
    itinerary: ItineraryItem[];
    
    bookingLink: string;
}

export const mapServerPackageToClient = (pkg: any): TourPackage => ({
  id: Number(pkg.id),
  imageUrl: pkg.homepage_image_url || '',
  imageAlt: pkg.homepage_image_alt || '',
  imageHint: pkg.homepage_image_hint || '',
  homepageTitle: pkg.homepage_title || '',
  homepageDescription: pkg.homepage_description || '',
  tourPageTitle: pkg.tour_page_title || '',
  duration: pkg.duration || '',
  price: pkg.price || '',
  priceSuffix: pkg.price_suffix || '',
  heroImage: pkg.hero_image_url || '',
  heroImageHint: pkg.hero_image_hint || '',
  tourPageDescription: pkg.tour_page_description || '',
  tourHighlights: pkg.highlights || [],
  inclusions: pkg.inclusions ? pkg.inclusions.map((i: { text: string }) => i.text) : [],
  itinerary: pkg.itinerary || [],
  bookingLink: pkg.booking_link || '/booking',
});

// This array is now empty. All tour packages should be managed and fetched from the server.
export const initialTourPackages: TourPackage[] = [];
