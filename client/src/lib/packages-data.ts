
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
    pricingTiers?: PricingTier[];
    heroImage: string;
    heroImageHint: string;
    tourPageDescription: string;
    tourHighlights: TourHighlight[];
    inclusions: TourInclusion[];
    itinerary: ItineraryItem[];
    experienceGallery: GalleryImage[];
    
    bookingLink: string;

    // SEO & Metadata
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    canonicalUrl?: string;
}

export interface PricingTier {
  min_guests: number;
  max_guests: number | null; // null means "and above" (e.g. 4+)
  price: number;
  pricing_type: 'per_person' | 'fixed_group';
}

export interface PriceCalculationResult {
  totalPrice: number;
  unitPrice: number;
  appliedTier: PricingTier | null;
  pricingType: 'per_person' | 'fixed_group';
  isTiered: boolean;
}

export function calculatePackagePrice(
  pkg: TourPackage | null | undefined,
  totalGuests: number
): PriceCalculationResult {
  if (!pkg || totalGuests <= 0) {
    return {
      totalPrice: 0,
      unitPrice: 0,
      appliedTier: null,
      pricingType: 'per_person',
      isTiered: false,
    };
  }

  const basePriceNum = parseFloat((pkg.price || '').replace(/[^0-9.-]+/g, '')) || 0;

  if (!pkg.pricingTiers || pkg.pricingTiers.length === 0) {
    return {
      totalPrice: basePriceNum * totalGuests,
      unitPrice: basePriceNum,
      appliedTier: null,
      pricingType: 'per_person',
      isTiered: false,
    };
  }

  // Sort tiers by min_guests ascending
  const sortedTiers = [...pkg.pricingTiers].sort((a, b) => a.min_guests - b.min_guests);

  // Match tier based on totalGuests
  const matchedTier = sortedTiers.find((tier) => {
    const isAboveMin = totalGuests >= tier.min_guests;
    const isBelowMax = tier.max_guests === null || totalGuests <= tier.max_guests;
    return isAboveMin && isBelowMax;
  });

  if (matchedTier) {
    const isFixed = matchedTier.pricing_type === 'fixed_group';
    const totalPrice = isFixed ? matchedTier.price : matchedTier.price * totalGuests;
    const unitPrice = isFixed ? (totalGuests > 0 ? matchedTier.price / totalGuests : matchedTier.price) : matchedTier.price;

    return {
      totalPrice,
      unitPrice,
      appliedTier: matchedTier,
      pricingType: matchedTier.pricing_type,
      isTiered: true,
    };
  }

  // Fallback to base price
  return {
    totalPrice: basePriceNum * totalGuests,
    unitPrice: basePriceNum,
    appliedTier: null,
    pricingType: 'per_person',
    isTiered: false,
  };
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
  pricingTiers: Array.isArray(pkg.pricing_tiers)
    ? pkg.pricing_tiers.map((t: any) => ({
        min_guests: Number(t.min_guests) || 1,
        max_guests: t.max_guests !== null && t.max_guests !== undefined && t.max_guests !== '' ? Number(t.max_guests) : null,
        price: Number(t.price) || 0,
        pricing_type: t.pricing_type === 'fixed_group' ? 'fixed_group' : 'per_person',
      }))
    : [],
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
  metaTitle: pkg.meta_title || '',
  metaDescription: pkg.meta_description || '',
  metaKeywords: pkg.meta_keywords || '',
  canonicalUrl: pkg.canonical_url || '',
});

import { API_BASE_URL } from './utils';

// This array is now empty. All tour packages should be managed and fetched from the server.
export const initialTourPackages: TourPackage[] = [];

/**
 * Fetch all tour packages for SSR with ISR support
 */
export async function fetchTourPackages(revalidateSeconds = 3600): Promise<TourPackage[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/tours`, {
      next: { revalidate: revalidateSeconds },
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      console.warn(`[fetchTourPackages] Request failed with status ${response.status}`);
      return [];
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      return data.map(mapServerPackageToClient);
    }
  } catch (error) {
    console.error('[fetchTourPackages] Failed to fetch tour packages:', error);
  }
  return [];
}
