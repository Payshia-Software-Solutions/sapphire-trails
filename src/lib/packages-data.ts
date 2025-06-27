import { type LucideIcon, MapPin, Gem, Landmark, Award, Utensils, Star, Package, Coffee, BedDouble } from 'lucide-react';

export interface TourFeature {
  icon: LucideIcon;
  text: string;
}

export interface TourPackage {
    id: string;
    imageUrl: string;
    imageAlt: string;
    imageHint: string;
    title?: {
        line1: string;
        line2: string;
        line3: string;
    };
    // For homepage card
    homepageTitle: string; 
    homepageDescription: string;
    features: TourFeature[];
    price: string;
    priceSuffix: string;
    bookingLink: string;
}

export const initialTourPackages: TourPackage[] = [
    {
        id: 'gem-explorer-day-tour',
        imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img4.webp',
        imageAlt: 'A group of smiling tourists wearing hard hats on a sapphire mine tour.',
        imageHint: 'tourists mining gems',
        title: {
            line1: 'GEM EXPLORER',
            line2: 'GEM XPLOR',
            line3: 'DAY TOUR',
        },
        homepageTitle: 'Exclusive Sapphire Mine Tour with Hands-On Discovery',
        homepageDescription: "Dive deep into the world of gem mining with expert guides. Discover the secrets behind Sri Lanka's most precious sapphires and immerse yourself in authentic local traditions.",
        features: [
            { icon: MapPin, text: 'GUIDED MINE TOUR' },
            { icon: Gem, text: 'Gem market tour' },
            { icon: Gem, text: 'Traditional & Modern Gem cutting tour' },
            { icon: Landmark, text: 'Gem museum visit' },
            { icon: Award, text: 'Gem Showcase from premium vendors' },
            { icon: Utensils, text: 'SNACK AT THE MINE LUNCH AT GRAND SILVER RAY' },
        ],
        price: '$135',
        priceSuffix: 'per person',
        bookingLink: '/booking',
    },
    {
        id: 'sapphire-trails-deluxe',
        imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img5.webp',
        imageAlt: 'The logo for Sapphire Trails Deluxe tours.',
        imageHint: 'luxury gem logo',
        homepageTitle: 'Tea Estate & Luxury Dining',
        homepageDescription: "Savor the flavors of Sri Lanka with a private tour of a lush tea estate, followed by a curated gourmet dining experience in an elegant setting surrounded by nature.",
        features: [
            { icon: Star, text: 'Includes everything from the Gem Explorer Tour' },
            { icon: Package, text: 'GEM EXPLORER TOUR' },
            { icon: Coffee, text: 'TEA FACTORY TOUR & TEA TASTING SESSION' },
            { icon: BedDouble, text: 'ONE NIGHT FULL BOARD STAY AT GRAND SILVER RAY' },
        ],
        price: '$215',
        priceSuffix: 'per person',
        bookingLink: '/booking',
    }
];
