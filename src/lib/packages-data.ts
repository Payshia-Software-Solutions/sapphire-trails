
import { type LucideIcon, MapPin, Gem, Landmark, Award, Utensils, Star, Package, Coffee, BedDouble, Users, Mountain } from 'lucide-react';

export interface GalleryImage {
  src: string;
  alt: string;
  hint: string;
  is360?: boolean;
}

export interface TourFeature {
  icon: LucideIcon;
  text: string;
}

export interface TourHighlight {
  icon: string;
  title: string;
  description: string;
}

export interface TourInclusion {
    icon: string;
    title: string;
    description: string;
    sort_order: number;
}

export interface ItineraryItem {
  time: string;
  title: string;
  description: string;
}

export interface TourPackage {
    id: number;
    slug: string;
    
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
    inclusions: TourInclusion[];
    itinerary: ItineraryItem[];
    experienceGallery: GalleryImage[];
    
    bookingLink: string;
}

const IMAGE_BASE_URL = 'https://content-provider.payshia.com/sapphire-trail';

// Helper to construct full URL from a relative path
const getFullImageUrl = (path: string | null | undefined) => {
    if (!path || path.startsWith('http') || path.startsWith('data:')) {
        return path || '';
    }
    // Robustly join the paths, avoiding double slashes.
    const cleanBase = IMAGE_BASE_URL.replace(/\/$/, ""); // Remove trailing slash from base
    const cleanPath = path.startsWith('/') ? path : `/${path}`; // Add leading slash to path if missing
    return `${cleanBase}${cleanPath}`;
}

export const mapServerPackageToClient = (pkg: any): TourPackage => ({
  id: Number(pkg.id),
  slug: pkg.slug,
  imageUrl: getFullImageUrl(pkg.homepage_image_url),
  imageAlt: pkg.homepage_image_alt || '',
  imageHint: pkg.homepage_image_hint || '',
  homepageTitle: pkg.homepage_title || '',
  homepageDescription: pkg.homepage_description || '',
  tourPageTitle: pkg.tour_page_title || '',
  duration: pkg.duration || '',
  price: pkg.price || '',
  priceSuffix: pkg.price_suffix || '',
  heroImage: getFullImageUrl(pkg.hero_image_url),
  heroImageHint: pkg.hero_image_hint || '',
  tourPageDescription: pkg.tour_page_description || '',
  tourHighlights: pkg.highlights || [],
  inclusions: pkg.inclusions || [],
  itinerary: pkg.itinerary || [],
  experienceGallery: (pkg.experience_gallery || []).map((img: any) => ({
      src: getFullImageUrl(img.image_url),
      alt: img.alt_text || '',
      hint: img.hint || ''
  })),
  bookingLink: pkg.booking_link || '/booking',
});

// This array is now empty. All tour packages should be managed and fetched from the server.
export const initialTourPackages: TourPackage[] = [];
