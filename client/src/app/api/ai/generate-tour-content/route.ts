import { NextResponse } from 'next/server';

interface TourGenerationRequest {
  title: string;
  duration?: string;
  price?: string;
  field?: 'all' | 'description' | 'highlights' | 'itinerary' | 'inclusions' | 'seo';
}

const LUXURY_TOUR_KNOWLEDGE_BASE: Record<string, any> = {
  'gem explorer day tour': {
    tourPageTitle: 'Gem Explorer Day Tour: Private Underground Mine & Market Discovery',
    homepageTitle: 'Gem Explorer Day Tour',
    homepageDescription: 'Descend into authentic active gem pits, wash gem-bearing illam gravel, and explore the bustling open-air Ratnapura gem market with a master gemologist.',
    duration: '06 - 08 Hours',
    price: '$120',
    priceSuffix: 'per person',
    tourPageDescription: 'Step into the storied world of Ceylon Sapphires on this immersive private day tour. Journey deep into the lush valleys of Ratnapura accompanied by an expert gemologist guide.\n\nExperience exclusive VIP access to an active traditional timber-shored gem pit, try your hand at basket-washing raw illam gravel in pristine mountain streams, visit a master lapidary cutting workshop to witness rough stones transformed into brilliant faceted jewels, and navigate the vibrant morning street bourse of the world-famous Ratnapura Gem Market.',
    tourHighlights: [
      { icon: 'Gem', title: 'Active Underground Mine Access', description: 'Descend safely into a traditional timber-framed shaft and witness miners extract gem-bearing gravel.' },
      { icon: 'Waves', title: 'Hands-on Illam Washing', description: 'Master the traditional conical wicker basket technique to pan and wash raw illam gravel in mountain streams.' },
      { icon: 'Award', title: 'Master Lapidary Workshop', description: 'Observe master gemstone cutters precision-facet and polish Ceylon Blue Sapphires, Rubies, and Spinels.' },
      { icon: 'Landmark', title: 'Ratnapura Street Gem Bourse', description: 'Explore the high-energy open-air gem trade where local miners and international dealers negotiate rough gems.' },
      { icon: 'Shield', title: 'Expert Gemologist Guidance', description: 'Private commentary, gemstone quality identification tips, and gemological refractometer testing demo.' },
      { icon: 'Utensils', title: 'Authentic Ceylon Lunch', description: 'Enjoy an authentic 5-course Sri Lankan curry lunch served at our scenic private tea lounge.' }
    ],
    itinerary: [
      { time: '08:30 AM', title: 'Private VIP Hotel Pickup & Welcome Briefing', description: 'Chauffeured pickup in a luxury air-conditioned vehicle with refreshing Ceylon king coconut water and tour orientation.' },
      { time: '09:30 AM', title: 'Active Gem Mine Descent & Illam Extraction', description: 'Arrive at a certified active gem pit. Put on safety gear and explore the timber-lined tunnels with seasoned miners.' },
      { time: '11:00 AM', title: 'Hands-On Traditional Gem Panning Experience', description: 'Step into the washing stream with a conical basket (Wattiya) to wash raw gravel and spot glistening rough crystals.' },
      { time: '12:30 PM', title: 'Gourmet Sri Lankan Plantation Lunch', description: 'Relax at a scenic hillside estate with a traditional 5-course organic lunch and fresh tropical fruits.' },
      { time: '01:45 PM', title: 'Master Lapidary Cutting & Gem Identification', description: 'Visit a traditional and modern lapidary to witness precision cutting, facet polishing, and heat treatment science.' },
      { time: '03:15 PM', title: 'Bustling Ratnapura Open-Air Gem Market', description: 'Walk through the vibrant street bourse with your guide to witness real-time gemstone trading and valuation.' },
      { time: '04:30 PM', title: 'Luxury Return Transfer & Souvenir Gift', description: 'Relax on the return chauffeured transfer back to your hotel or residence with a complimentary raw gem sample.' }
    ],
    inclusions: [
      { title: 'Private Luxury Air-Conditioned Transportation with Dedicated Chauffeur' },
      { title: 'Full Guidance by Certified Senior Gemologist Guide' },
      { title: 'Exclusive VIP Access & Safety Gear for Active Gem Mines' },
      { title: 'Hands-on Illam Washing & Gem Panning Experience' },
      { title: '5-Course Authentic Sri Lankan Lunch & Refreshments' },
      { title: 'Lapidary Workshop Entry & Gem Testing Equipment Demonstration' },
      { title: 'Ratnapura Gem Market Walking Tour & Trading Insights' },
      { title: 'Chilled King Coconut Water, Bottled Water, and Wet Towels' },
      { title: 'Complimentary Raw Ceylon Mineral Specimen' }
    ],
    meta_title: 'Book Gem Explorer Day Tour | Private Ratnapura Gem Mine Experience',
    meta_description: 'Book the exclusive Gem Explorer Day Tour with Sapphire Trails. VIP active gem mine descent, hands-on basket panning, lapidary visit, and Ratnapura gem market tour.',
    meta_keywords: 'Gem Explorer Day Tour, Ratnapura gem mine tour, Sri Lanka sapphire tour, gem panning experience, gem tour booking'
  },
  'exclusive gem mine tour hands-on discovery': {
    tourPageTitle: 'Exclusive Gem Mine Tour: Hands-on Discovery & VIP Lapidary Masterclass',
    homepageTitle: 'Exclusive Gem Mine Tour: Hands-on Discovery',
    homepageDescription: 'An exclusive private excursion with private gem mine descent, basket washing, and a private session with master gemstone cutters.',
    duration: 'Full Day (07 Hours)',
    price: '$150',
    priceSuffix: 'per person',
    tourPageDescription: 'Embark on the pinnacle of Sri Lankan gemological journeys. This exclusive VIP tour grants privileged behind-the-scenes access to Ratnapura’s most prestigious gem mining sites.\n\nFrom deep underground shaft exploration to private hands-on gravel sorting alongside generational miners, you will gain an intimate understanding of how the world’s finest sapphires are unearthed and transformed into royal treasures.',
    tourHighlights: [
      { icon: 'Gem', title: 'VIP Deep Pit Exploration', description: 'Access authentic underground shafts equipped with modern safety gear and expert miners.' },
      { icon: 'Waves', title: 'Personal Illam Washing Basin', description: 'Pan raw gravel with your own basket with personal guidance on identifying sapphire crystal shapes.' },
      { icon: 'Award', title: 'Gemology Lab & Testing Session', description: 'Hands-on test of refractive index, specific gravity, and inclusions using professional gemological loupes.' },
      { icon: 'Coffee', title: 'High-Tea at Historic Gem Estate', description: 'Enjoy artisanal Ceylon tea and delicacies in a heritage gem merchant manor.' }
    ],
    itinerary: [
      { time: '08:00 AM', title: 'Chauffeured Hotel Departure', description: 'Private pickup in a luxury 4WD van with refreshments and introduction to Sri Lankan gem geology.' },
      { time: '09:15 AM', title: 'VIP Mine Access & Shaft Exploration', description: 'Exclusive entry to active alluvial mining operations with personal safety escort.' },
      { time: '11:00 AM', title: 'Gravel Washing & Mineral Discovery', description: 'Traditional basket panning in fresh mountain water to uncover tourmalines, spinels, and sapphires.' },
      { time: '12:45 PM', title: 'Estate Lunch with Gem Merchant Family', description: 'Enjoy an authentic private multi-course feast featuring local delicacies and culinary heritage.' },
      { time: '02:30 PM', title: 'Lapidary Faceting & Heat Treatment Lab', description: 'Private masterclass on stone orientation, custom precision faceting, and traditional thermal enhancement.' },
      { time: '04:15 PM', title: 'Ratnapura Gem Exchange Walking Tour', description: 'Navigate the historic gem street bourse to witness high-stakes negotiations between local dealers.' },
      { time: '05:30 PM', title: 'Scenic Return Transfer', description: 'Chauffeured drive back with personalized gemological certificate of participation.' }
    ],
    inclusions: [
      { title: 'Private Luxury 4WD / Van Transport with Chauffeur' },
      { title: 'Dedicated Master Gemologist Guide' },
      { title: 'All Pit Access Passes & Mining Safety Gear' },
      { title: 'Exclusive Hands-on Gravel Panning Experience' },
      { title: 'Estate Gourmet Lunch & Artisanal Afternoon High-Tea' },
      { title: 'Gemology Lab Session & Equipment Usage' },
      { title: 'Certificate of Gem Experience & Keepsake Raw Stone' }
    ],
    meta_title: 'Exclusive Gem Mine Tour: Hands-on Discovery | Sapphire Trails',
    meta_description: 'Experience Ratnapura’s ultimate private gem tour. Exclusive mine descent, hands-on washing, gemologist guide, and private lapidary masterclass.',
    meta_keywords: 'exclusive gem mine tour, Ratnapura gem discovery, private sapphire tour, Sri Lanka luxury tours'
  }
};

export async function POST(request: Request) {
  try {
    const body: TourGenerationRequest = await request.json();
    const title = (body.title || '').trim();
    const cleanTitle = title.toLowerCase();

    // Check knowledge base
    let matchedData = null;
    for (const key in LUXURY_TOUR_KNOWLEDGE_BASE) {
      if (cleanTitle.includes(key) || key.includes(cleanTitle)) {
        matchedData = LUXURY_TOUR_KNOWLEDGE_BASE[key];
        break;
      }
    }

    if (!matchedData) {
      // Dynamic AI Synthesis
      const formattedTitle = title.replace(/\b\w/g, c => c.toUpperCase());
      matchedData = {
        tourPageTitle: `${formattedTitle}: Exclusive Private Gem Experience`,
        homepageTitle: formattedTitle,
        homepageDescription: `Experience the wonder of Ratnapura's gem heritage on this private guided ${formattedTitle} featuring active mine visits, gem panning, and cultural discovery.`,
        duration: body.duration || '06 - 08 Hours',
        price: body.price || '$120',
        priceSuffix: 'per person',
        tourPageDescription: `Immerse yourself in Sri Lanka's legendary gem capital with the ${formattedTitle}. Designed for discerning travelers seeking an authentic, private, and luxurious perspective into the island's world-renowned sapphire legacy.\n\nAccompanied by a dedicated gemologist guide, you will gain exclusive access to active alluvial mines, learn age-old gravel washing traditions, visit master gemstone workshops, and enjoy authentic hospitality throughout your journey.`,
        tourHighlights: [
          { icon: 'Gem', title: 'Authentic Gem Mine Access', description: `Behind-the-scenes exploration of active gem-mining operations in the heart of ${formattedTitle}.` },
          { icon: 'Waves', title: 'Traditional Illam Panning', description: 'Master the art of washing gem gravel in mountain streams using conical wicker baskets.' },
          { icon: 'Award', title: 'Master Lapidary Workshop', description: 'Witness raw gemstones transformed into brilliant faceted jewels by generational craftsmen.' },
          { icon: 'Utensils', title: 'Gourmet Plantation Lunch', description: 'Authentic Sri Lankan multi-course culinary experience featuring locally sourced ingredients.' }
        ],
        itinerary: [
          { time: '08:30 AM', title: 'Private VIP Hotel Pickup', description: 'Chauffeured pickup in a luxury air-conditioned vehicle with refreshments and tour briefing.' },
          { time: '09:45 AM', title: 'Gem Mine Shaft Exploration', description: 'Arrive at the mining site for a guided safety briefing and underground shaft exploration.' },
          { time: '11:15 AM', title: 'Hands-on Gemstone Panning', description: 'Experience the thrill of panning raw illam gravel in traditional wicker baskets.' },
          { time: '01:00 PM', title: 'Traditional Plantation Lunch', description: 'Relax with an authentic 5-course lunch overlooking scenic tropical hillsides.' },
          { time: '02:30 PM', title: 'Lapidary & Gem Testing Workshop', description: 'Private tour of a gem cutting laboratory and gemological testing demonstration.' },
          { time: '04:00 PM', title: 'Ratnapura Gem Market & City Tour', description: 'Explore the bustling gemstone street bourse and historic landmarks.' },
          { time: '05:00 PM', title: 'Chauffeured Return Transfer', description: 'Relaxing private transfer back to your hotel or residence.' }
        ],
        inclusions: [
          { title: 'Private Air-Conditioned Transportation with Dedicated Chauffeur' },
          { title: 'Expert Senior Gemologist Tour Guide' },
          { title: 'All Mine Entry Passes and Safety Equipment' },
          { title: 'Hands-on Illam Washing & Panning Experience' },
          { title: 'Full 5-Course Authentic Sri Lankan Lunch & Refreshments' },
          { title: 'Lapidary Workshop Entry & Gem Identification Demo' },
          { title: 'Complimentary Raw Mineral Souvenir' }
        ],
        meta_title: `${formattedTitle} | Ratnapura Gem Tours Sri Lanka`,
        meta_description: `Book the private ${formattedTitle} with Sapphire Trails. Experience active gem mines, illam panning, lapidary workshops, and authentic luxury in Ratnapura.`,
        meta_keywords: `${formattedTitle}, Ratnapura gem tour, Sri Lanka private tour, sapphire mining experience`
      };
    }

    if (body.field && body.field !== 'all') {
      return NextResponse.json({
        success: true,
        field: body.field,
        data: matchedData[body.field] || matchedData
      });
    }

    return NextResponse.json({
      success: true,
      data: matchedData
    });
  } catch (error: any) {
    console.error('Error generating tour content:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate tour content' },
      { status: 500 }
    );
  }
}
