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

export interface TourPackage {
    id: string; // slug
    
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
    
    bookingLink: string;
}

export const initialTourPackages: TourPackage[] = [
    {
        id: 'gem-explorer-day-tour',
        imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img4.webp',
        imageAlt: 'A group of smiling tourists wearing hard hats on a sapphire mine tour.',
        imageHint: 'tourists mining gems',
        homepageTitle: 'Exclusive Sapphire Mine Tour with Hands-On Discovery',
        homepageDescription: "Dive deep into the world of gem mining with expert guides. Discover the secrets behind Sri Lanka's most precious sapphires and immerse yourself in authentic local traditions.",
        
        tourPageTitle: 'Gem Explorer Day Tour',
        duration: '8 Hours',
        price: '$135',
        priceSuffix: 'per person',
        heroImage: 'https://content-provider.payshia.com/sapphire-trail/images/img4.webp',
        heroImageHint: 'tourists mining gems',
        tourPageDescription: 'Embark on an unforgettable underground adventure as you explore authentic gem mines, discover precious stones, and learn from expert geologists in this immersive full-day experience.',
        tourHighlights: [
            { icon: 'Gem', title: 'Gem Discovery', description: 'Find and keep precious gems' },
            { icon: 'Users', title: 'Expert Guides', description: 'Professional geologist guidance' },
            { icon: 'Mountain', title: 'Underground Adventure', description: 'Explore authentic mine tunnels' },
        ],
        inclusions: [
            'GUIDED MINE TOUR',
            'Gem market tour',
            'Traditional & Modern Gem cutting tour',
            'Gem museum visit',
            'Gem Showcase from premium vendors',
            'SNACK AT THE MINE LUNCH AT GRAND SILVER RAY'
        ],
        bookingLink: '/booking',
    },
    {
        id: 'sapphire-trails-deluxe',
        imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img5.webp',
        imageAlt: 'The logo for Sapphire Trails Deluxe tours.',
        imageHint: 'luxury gem logo',
        homepageTitle: 'Tea Estate & Luxury Dining',
        homepageDescription: "Savor the flavors of Sri Lanka with a private tour of a lush tea estate, followed by a curated gourmet dining experience in an elegant setting surrounded by nature.",

        tourPageTitle: 'Sapphire Trails Deluxe',
        duration: '1 Night Stay',
        price: '$215',
        priceSuffix: 'per person',
        heroImage: 'https://content-provider.payshia.com/sapphire-trail/images/img31.webp',
        heroImageHint: 'luxury resort architecture',
        tourPageDescription: 'Experience the ultimate luxury journey, combining the thrill of gem exploration with the tranquility of a tea estate and a gourmet dining experience, complete with an overnight stay.',
        tourHighlights: [
            { icon: 'Star', title: 'All-Inclusive', description: 'Includes all Gem Explorer perks' },
            { icon: 'Coffee', title: 'Tea Estate Tour', description: 'Private tour and tea tasting session' },
            { icon: 'BedDouble', title: 'Luxury Stay', description: 'Full board at Grand Silver Ray' },
        ],
        inclusions: [
            'Includes everything from the Gem Explorer Tour',
            'GEM EXPLORER TOUR',
            'TEA FACTORY TOUR & TEA TASTING SESSION',
            'ONE NIGHT FULL BOARD STAY AT GRAND SILVER RAY'
        ],
        bookingLink: '/booking',
    }
];
