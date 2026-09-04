

import { Leaf, Mountain, Bird, Home, Clock, CalendarDays, Ticket, Users, AlertTriangle, Gem, Waves, Landmark, Camera, Tent, Thermometer } from 'lucide-react';

export interface GalleryImage {
  id?: number;
  src: string;
  alt: string;
  hint: string;
  is360?: boolean;
}

export interface Highlight {
  icon: string;
  title: string;
  description: string;
}

export interface VisitorInfo {
  icon: string;
  title: string;
  line1: string;
  line2: string;
}

export interface NearbyAttraction {
  icon: string;
  name: string;
  distance: string;
}

export interface Location {
  slug: string;
  title: string;
  cardDescription: string;
  cardImage: string;
  imageHint: string;
  distance: string;
  subtitle: string;
  heroImage: string;
  heroImageHint: string;
  intro: {
    title: string;
    description: string;
    imageUrl: string;
    imageHint: string;
  };
  galleryImages: GalleryImage[];
  highlights: Highlight[];
  visitorInfo: VisitorInfo[];
  map: {
    embedUrl: string;
    nearbyAttractions: NearbyAttraction[];
  };
  category: 'nature' | 'agriculture' | 'cultural';
}

const IMAGE_BASE_URL = 'https://content-provider.payshia.com/sapphire-trail';

// Helper to construct full URL from a relative path
const getFullImageUrl = (path: string | null | undefined) => {
    if (!path || path.startsWith('http') || path.startsWith('data:')) {
        return path || '';
    }
    // This robustly joins the base URL and the relative path, avoiding double slashes.
    const cleanBase = IMAGE_BASE_URL.endsWith('/') ? IMAGE_BASE_URL.slice(0, -1) : IMAGE_BASE_URL;
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return `${cleanBase}${cleanPath}`;
};


export const mapServerLocationToClient = (loc: any): Location => ({
  slug: loc.slug || '',
  title: loc.title || '',
  cardDescription: loc.card_description || '',
  cardImage: getFullImageUrl(loc.card_image_url),
  imageHint: loc.card_image_hint || '',
  distance: loc.distance || '',
  subtitle: loc.subtitle || '',
  heroImage: getFullImageUrl(loc.hero_image_url),
  heroImageHint: loc.hero_image_hint || '',
  intro: {
    title: loc.intro_title || '',
    description: loc.intro_description || '',
    imageUrl: getFullImageUrl(loc.intro_image_url),
    imageHint: loc.intro_image_hint || '',
  },
  galleryImages: (loc.gallery_images || []).map((img: any) => ({
      id: img.id,
      src: getFullImageUrl(img.image_url), 
      alt: img.alt_text || '', 
      hint: img.hint || '' 
  })),
  highlights: loc.highlights || [],
  visitorInfo: loc.visitor_info || [],
  map: {
    embedUrl: loc.map_embed_url || '',
    nearbyAttractions: loc.nearby_attractions || [],
  },
  category: loc.category || 'nature',
});


export const natureAndWildlife: Omit<Location, 'category'>[] = [];

export const locationsData: Location[] = natureAndWildlife.map(location => ({
    ...location,
    category: 'nature',
}));
