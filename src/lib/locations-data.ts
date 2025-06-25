import { Leaf, Mountain, Bird, Home, Clock, CalendarDays, Ticket, Users, AlertTriangle, Gem, Waves, Landmark, Camera, Tent, Thermometer } from 'lucide-react';

export const natureAndWildlife = [
  {
    slug: "sinharaja-rainforest",
    title: "Sinharaja Rainforest",
    cardDescription: "UNESCO World Heritage Site with rich biodiversity, lush trails, and exotic wildlife.",
    cardImage: "https://content-provider.payshia.com/sapphire-trail/images/img7.webp",
    imageHint: "rainforest canopy",
    distance: "12 km away",
    subtitle: "Nature's Unspoiled Wonder",
    heroImage: "https://content-provider.payshia.com/sapphire-trail/images/img7.webp",
    heroImageHint: "rainforest misty mountains",
    intro: {
        title: "UNESCO World Heritage Wonder",
        description: "Sinharaja Rainforest stands as Sri Lanka’s last viable area of primary tropical rainforest, harboring an extraordinary collection of endemic species. This pristine wilderness covers 11,187 hectares of untouched biodiversity, where ancient trees tower over 45 meters high and rare species thrive in their natural habitat. Experience guided eco-treks through dense canopies, witness endemic bird species, and immerse yourself in one of the world's most biodiverse ecosystems. Perfect for nature enthusiasts, researchers, and adventure seekers looking to connect with pristine wilderness.",
        imageUrl: "https://content-provider.payshia.com/sapphire-trail/images/img6.webp",
        imageHint: "jungle river rocks"
    },
    galleryImages: [
        { src: 'https://content-provider.payshia.com/sapphire-trail/images/img9.webp', alt: 'A trail winding through the Sinharaja rainforest.', hint: 'rainforest path' },
        { src: 'https://content-provider.payshia.com/sapphire-trail/images/img8.webp', alt: 'A beautiful cascading waterfall within the rainforest.', hint: 'jungle waterfall' },
        { src: 'https://content-provider.payshia.com/sapphire-trail/images/img3.webp', alt: 'Sifting for gems in a traditional woven basket.', hint: 'sifting gems' },
        { src: 'https://content-provider.payshia.com/sapphire-trail/images/img1.webp', alt: 'A collection of rough, uncut blue sapphires held in hands.', hint: 'raw sapphires' },
    ],
    highlights: [
        { icon: 'Leaf', title: 'Biodiversity', description: 'Home to 60% of Sri Lanka’s endemic trees and countless rare species.' },
        { icon: 'Mountain', title: 'Guided Hikes', description: 'Expert-led trails through pristine wilderness paths.' },
        { icon: 'Bird', title: 'Bird Watching', description: 'Spot endemic species like the Red-faced Malkoha.' },
        { icon: 'Home', title: 'Eco-Lodging', description: 'Sustainable accommodations within the forest buffer zone.' },
    ],
    visitorInfo: [
        { icon: 'Clock', title: 'Opening Hours', line1: '6:00 AM - 6:00 PM', line2: 'Daily (Weather permitting)' },
        { icon: 'CalendarDays', title: 'Best Time', line1: 'Dec - Apr', line2: 'Dry season recommended' },
        { icon: 'Ticket', title: 'Entry Fees', line1: 'LKR 3,000', line2: 'Foreign visitors' },
        { icon: 'Users', title: 'Local Guides', line1: 'Available', line2: 'Recommended for safety' },
    ],
    map: {
        image: 'https://placehold.co/1200x800.png',
        hint: 'sri lanka map',
        nearbyAttractions: [
            { icon: 'AlertTriangle', name: "Adam's Peak", distance: '45 km away' },
            { icon: 'Gem', name: 'Gem Mining Site', distance: '15 km away' },
            { icon: 'Waves', name: 'Bopath Falls', distance: '25 km away' },
        ]
    }
  },
  {
    slug: "bopath-ella-falls",
    title: "Bopath Ella Falls",
    cardDescription: "Iconic waterfall famed for its shape, surrounded by lush forest and local eateries.",
    cardImage: "https://content-provider.payshia.com/sapphire-trail/images/img14.webp",
    imageHint: "waterfall jungle",
    distance: "8 km away",
    subtitle: "The Sacred Bo-Leaf",
    heroImage: "https://content-provider.payshia.com/sapphire-trail/images/img14.webp",
    heroImageHint: "jungle waterfall",
    intro: {
        title: "A Natural Masterpiece",
        description: "Bopath Ella, named for its perfect resemblance to a leaf from the sacred Bo tree, is one of Sri Lanka's most iconic waterfalls. Cascading from a height of 30 meters, its beauty is accessible and captivating. The area is well-developed for tourism, offering safe swimming areas and local eateries where you can enjoy a meal with a view. It's a perfect spot for a family outing or a refreshing dip in nature's own infinity pool.",
        imageUrl: "https://content-provider.payshia.com/sapphire-trail/images/img10.webp",
        imageHint: "waterfall rocks"
    },
    galleryImages: [
        { src: 'https://content-provider.payshia.com/sapphire-trail/images/img15.webp', alt: 'Bopath Ella Falls from a distance', hint: 'waterfall distance' },
        { src: 'https://content-provider.payshia.com/sapphire-trail/images/img12.webp', alt: 'People enjoying the water near the falls', hint: 'swimming waterfall' },
        { src: 'https://content-provider.payshia.com/sapphire-trail/images/img13.webp', alt: 'Lush greenery surrounding Bopath Ella Falls', hint: 'jungle greenery' },
        { src: 'https://content-provider.payshia.com/sapphire-trail/images/img11.webp', alt: 'A close-up view of the cascading water at Bopath Ella', hint: 'waterfall close' },
    ],
    highlights: [
        { icon: 'Mountain', title: 'Scenic Beauty', description: 'Enjoy the scenic beauty of the waterfall.' },
        { icon: 'Waves', title: 'Natural Pools', description: 'Take a refreshing swim in the natural pools.' },
        { icon: 'Leaf', title: 'Trekking', description: 'Explore the surrounding lush greenery through trekking.' },
        { icon: 'Home', title: 'Local Culture', description: 'Visit nearby attractions like the Ratnapura Gem Market or the Maha Saman Devale.' },
    ],
    visitorInfo: [
        { icon: 'Clock', title: 'Opening Hours', line1: '6:00 AM - 7:00 PM', line2: 'Daily' },
        { icon: 'CalendarDays', title: 'Best Time', line1: 'May - Sep', line2: 'Wet season' },
        { icon: 'Ticket', title: 'Entry Fees', line1: 'LKR 100 (Locals)', line2: 'LKR 3,000 (Foreign)' },
        { icon: 'Users', title: 'Local Guides', line1: 'Not available', line2: 'Explore at your own pace' },
    ],
    map: {
        image: 'https://placehold.co/1200x800.png',
        hint: 'ratnapura map',
        nearbyAttractions: [
            { icon: 'Gem', name: "Ratnapura Gem Market", distance: '10 km away' },
            { icon: 'Landmark', name: 'Maha Saman Devale', distance: '12 km away' },
        ]
    }
  },
  {
    slug: "udawalawe-national-park",
    title: "Udawalawe National Park",
    cardDescription: "Elephant watching, jeep safaris, and diverse fauna in a vast, scenic landscape.",
    cardImage: "https://content-provider.payshia.com/sapphire-trail/images/img19.webp",
    imageHint: "elephants safari",
    distance: "40 km away",
    subtitle: "A Wild Haven",
    heroImage: "https://placehold.co/1920x1080.png",
    heroImageHint: "safari jeep elephants",
    intro: {
        title: "Home of the Gentle Giants",
        description: "Udawalawe National Park is an unparalleled destination for wildlife enthusiasts, particularly famous for its large population of Sri Lankan elephants. Spanning 30,821 hectares, the park's open grasslands and reservoir make it easy to spot herds of elephants, water buffalo, deer, and a rich variety of birdlife. Embark on a thrilling jeep safari to get up close with these magnificent creatures in their natural habitat.",
        imageUrl: "https://placehold.co/600x600.png",
        imageHint: "elephant family"
    },
    galleryImages: [
        { src: 'https://placehold.co/600x800.png', alt: 'Jeep on a safari', hint: 'jeep safari' },
        { src: 'https://placehold.co/600x400.png', alt: 'Herd of elephants by water', hint: 'elephant herd' },
        { src: 'https://placehold.co/600x400.png', alt: 'Water buffalo in a field', hint: 'water buffalo' },
        { src: 'https://placehold.co/600x400.png', alt: 'Peacock with feathers out', hint: 'peacock bird' },
        { src: 'https://placehold.co/600x400.png', alt: '360 view of the safari park', hint: 'safari panorama', is360: true },
    ],
    highlights: [
        { icon: 'Mountain', title: 'Jeep Safaris', description: 'Observe elephants and other wildlife on a thrilling jeep safari.' },
        { icon: 'Home', title: 'Elephant Transit Home', description: 'Visit the renowned center for orphaned elephant calves.' },
        { icon: 'Waves', title: 'Udawalawe Reservoir', description: 'Explore the vast reservoir, a lifeline for the park\'s ecosystem.' },
        { icon: 'Bird', title: 'Bird Watching', description: 'A paradise for birdwatchers with numerous resident and migratory species.' },
    ],
    visitorInfo: [
        { icon: 'Clock', title: 'Opening Hours', line1: '6:00 AM - 6:00 PM', line2: 'Daily' },
        { icon: 'CalendarDays', title: 'Best Time', line1: 'May - Sep', line2: 'Dry season' },
        { icon: 'Ticket', title: 'Entry Fees', line1: 'LKR 1,500 (Locals)', line2: 'LKR 8,700 (Foreign)' },
        { icon: 'Users', title: 'Local Guides', line1: 'Available', line2: 'Recommended for safaris' },
    ],
    map: {
        image: 'https://placehold.co/1200x800.png',
        hint: 'udawalawe map',
        nearbyAttractions: [
            { icon: 'Home', name: 'Udawalawe Elephant Transit Home', distance: 'Adjacent to park' },
            { icon: 'Waves', name: 'Udawalawe Reservoir', distance: 'Inside the park' },
            { icon: 'Landmark', name: 'Sankapala Raja Maha Viharaya', distance: '30 km away' },
            { icon: 'Thermometer', name: 'Madunagala Hot Springs', distance: '20 km away' },
        ]
    }
  },
  {
    slug: "kalthota-doowili-ella",
    title: "Kalthota Doowili Ella",
    cardDescription: "Secluded waterfall, pristine waters and a tranquil atmosphere for nature lovers.",
    cardImage: "https://content-provider.payshia.com/sapphire-trail/images/img23.webp",
    imageHint: "waterfall rocks",
    distance: "27 km away",
    subtitle: "The Dusty Waterfall",
    heroImage: "https://placehold.co/1920x1080.png",
    heroImageHint: "secluded jungle waterfall",
    intro: {
        title: "A Hidden Gem",
        description: "Known as 'Doowili Ella' or 'Dusty Falls' because its spray resembles a cloud of dust, this secluded waterfall is a reward for the adventurous traveler. Tucked away in Kalthota, it offers a more tranquil and untouched experience compared to more popular falls. The journey to the falls is as beautiful as the destination itself, making it a perfect escape for those seeking peace and natural beauty off the beaten path.",
        imageUrl: "https://placehold.co/600x600.png",
        imageHint: "misty waterfall"
    },
    galleryImages: [
        { src: 'https://placehold.co/600x800.png', alt: 'Doowili Ella falls from below', hint: 'waterfall jungle rocks' },
        { src: 'https://placehold.co/600x400.png', alt: 'Hiker on the trail to the falls', hint: 'hiking jungle' },
        { src: 'https://placehold.co/600x400.png', alt: 'Pool at the base of the waterfall', hint: 'waterfall pool' },
        { src: 'https://placehold.co/600x400.png', alt: 'Camping tent near the falls', hint: 'camping tent night' },
        { src: 'https://placehold.co/600x400.png', alt: '360 view of Doowili Ella', hint: 'waterfall panorama', is360: true },
    ],
    highlights: [
        { icon: 'Camera', title: 'Photography', description: 'Capture the beauty of the waterfall and its surroundings.' },
        { icon: 'Waves', title: 'Swimming', description: 'Enjoy a refreshing swim in the shallow pool at the base of the falls, especially during the dry season.' },
        { icon: 'Leaf', title: 'Nature Exploration', description: 'Observe the diverse flora and fauna in the area.' },
        { icon: 'Tent', title: 'Camping', description: 'Set up a small camp or tent near the falls and enjoy the peaceful atmosphere, especially during cold nights.' },
    ],
    visitorInfo: [
        { icon: 'Clock', title: 'Opening Hours', line1: 'Open all day', line2: '' },
        { icon: 'CalendarDays', title: 'Best Time', line1: 'Apr - Dec', line2: 'Rainy season' },
        { icon: 'Ticket', title: 'Entry Fees', line1: 'No official fee', line2: '' },
        { icon: 'Users', title: 'Local Guides', line1: 'Not available', line2: 'Explore at your own pace' },
    ],
    map: { 
        image: 'https://placehold.co/1200x800.png',
        hint: 'kalthota map',
        nearbyAttractions: [
            { icon: 'Waves', name: 'Kalthota Kuda Doowili Ella Falls', distance: 'Nearby' },
            { icon: 'Landmark', name: 'Uggal Kalthota Ancient Amuna', distance: 'Nearby' },
            { icon: 'Landmark', name: 'Budugala Ruins and Temple', distance: 'Nearby' },
        ]
    }
  },
];

export const locationsData = natureAndWildlife.map(location => ({
    ...location,
    // Add any additional processing or default values here if needed
}));
