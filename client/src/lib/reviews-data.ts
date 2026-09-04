'use client';

export interface ReviewItem {
  id: string;
  name: string;
  location: string;
  tour: string;
  date: string;
  rating: number;
  avatar: string;
  review: string;
  source: 'tripadvisor' | 'google' | 'direct';
  featured?: boolean;
  status: 'published' | 'hidden';
}

export const initialReviews: ReviewItem[] = [
  {
    id: 'rev-1',
    name: "Alexander & Sarah Wright",
    location: "London, United Kingdom 🇬🇧",
    tour: "Exclusive Private Mining Expedition",
    date: "February 2026",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    review: "Unquestionably the highlight of our 2-week trip to Sri Lanka! Descending into a real active mine and washing gravel alongside the miners gave us a profound appreciation for Ceylon sapphires. Our guide Kamal was deeply knowledgeable and the hospitality at Grand Silver Ray was 5-star.",
    source: 'tripadvisor',
    featured: true,
    status: 'published'
  },
  {
    id: 'rev-2',
    name: "Dr. Marcus Weber",
    location: "Munich, Germany 🇩🇪",
    tour: "Ratnapura Gemology & Market Immersion",
    date: "January 2026",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    review: "As a mineral collector, this was everything I hoped for. The street market trade in Ratnapura is mesmerizing to watch, and inspecting rough sapphires under microscope with certified gemologists was truly educational. Flawlessly organized with private Mercedes van transfer.",
    source: 'google',
    featured: true,
    status: 'published'
  },
  {
    id: 'rev-3',
    name: "Jessica & David Chen",
    location: "Sydney, Australia 🇦🇺",
    tour: "Custom Proposal & Engagement Ring Tour",
    date: "December 2025",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    review: "We found our own raw blue sapphire in the gravel and had it precision-cut into an engagement ring in Ratnapura. The entire experience was extraordinarily romantic, safe, and exclusive. Unforgettable memories with Sapphire Trails!",
    source: 'tripadvisor',
    featured: true,
    status: 'published'
  },
  {
    id: 'rev-4',
    name: "Elena Rostova",
    location: "Zurich, Switzerland 🇨🇭",
    tour: "Full Day Gem Pit & River Wash Tour",
    date: "March 2026",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    review: "Safety was top notch. Helmets, safety harnesses, and clear instructions made going 50 feet underground feel completely secure. Washing the illam in the stream and keeping the semi-precious stones was so much fun!",
    source: 'google',
    featured: true,
    status: 'published'
  },
  {
    id: 'rev-5',
    name: "Jean-Pierre Laurent",
    location: "Paris, France 🇫🇷",
    tour: "Exclusive Private Mining Expedition",
    date: "January 2026",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    review: "An extraordinary VIP tour. The helicopter arrival from Colombo directly to Ratnapura, the private gem testing lab consultation, and lunch by the river were world class.",
    source: 'tripadvisor',
    featured: false,
    status: 'published'
  }
];

const REVIEWS_STORAGE_KEY = 'sapphire_trails_reviews_v1';

export function getStoredReviews(): ReviewItem[] {
  if (typeof window === 'undefined') return initialReviews;
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(initialReviews));
      return initialReviews;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialReviews;
  } catch {
    return initialReviews;
  }
}

export function saveStoredReviews(reviews: ReviewItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.error('Failed to save reviews to localStorage', e);
  }
}
