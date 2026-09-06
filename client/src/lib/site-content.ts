import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';
import { triggerRevalidation } from '@/lib/revalidate';

export interface SiteContentData {
  // 1. Complete Homepage Sections
  homepage: {
    hero: {
      tagline: string;
      headlineLine1: string;
      headlineLine2: string;
      subheadline: string;
      ctaPrimaryText: string;
      ctaSecondaryText: string;
      videoUrl?: string;
      posterImageUrl?: string;
    };
    stats: Array<{
      value: string;
      label: string;
    }>;
    journey: {
      tagline: string;
      heading: string;
      subtitle: string;
      steps: Array<{
        step: string;
        title: string;
        subtitle: string;
        description: string;
        image?: string;
      }>;
    };
    discover: {
      tagline: string;
      heading: string;
      description: string;
      images: Array<{
        src: string;
        alt: string;
        hint: string;
        hoverDescription: string;
      }>;
    };
    toursHeader: {
      tagline: string;
      heading: string;
      subtitle: string;
    };
    reviewsHeader: {
      tagline: string;
      heading: string;
      subtitle: string;
    };
    exploreHeader: {
      tagline: string;
      heading: string;
      subtitle: string;
    };
    faqHeader: {
      tagline: string;
      heading: string;
      subtitle: string;
    };
    articlesHeader: {
      tagline: string;
      heading: string;
      subtitle: string;
    };
    subscription: {
      tagline: string;
      heading: string;
      subheadline: string;
      buttonText: string;
    };
    sectionVisibility?: {
      [key: string]: boolean | undefined;
    };
    sectionStyles?: {
      [key: string]: string | undefined;
    };
  };


  // 2. All 9 Complete About Us Page Sections
  about: {
    // 1. Hero Banner
    hero: {
      tagline: string;
      title: string;
      subtitle: string;
      image: string;
    };
    // 2. Impact Metrics
    metrics: Array<{
      value: string;
      label: string;
      description: string;
    }>;
    // 3. Our Story & Milestones
    story: {
      tagline: string;
      heading: string;
      paragraph1: string;
      paragraph2: string;
      quote: string;
      image: string;
      image2?: string;
      image3?: string;
      badge1: { year: string; title: string; desc: string };
      badge2: { year: string; title: string; desc: string };
      badge3: { year: string; title: string; desc: string };
    };

    // 4. Multi-Faceted Experience
    experience: {
      tagline: string;
      heading: string;
      description: string;
      items: Array<{
        title: string;
        description: string;
        image: string;
      }>;
    };
    // 5. Core Values & Principles
    values: {
      tagline: string;
      heading: string;
      subtitle: string;
      items: Array<{
        title: string;
        badge: string;
        description: string;
        points?: string[];
      }>;

    };
    // 6. 4-Stage Sapphire Journey
    gemJourney: {
      tagline: string;
      heading: string;
      subtitle: string;
      steps: Array<{
        step: string;
        title: string;
        description: string;
        image: string;
      }>;
    };
    // 7. Why Ratnapura
    whyRatnapura: {
      tagline: string;
      heading: string;
      paragraph1: string;
      paragraph2: string;
      quote: string;
      factTitle: string;
      factDesc: string;
      image: string;
    };
    // 8. Official Accreditations Trust Strip
    trustStrip: {
      heading: string;
      badge1: string;
      badge2: string;
      badge3: string;
      badge4: string;
    };
    // 9. Executive CTA Banner
    cta: {
      tagline: string;
      heading: string;
      subtitle: string;
      primaryButtonText: string;
      secondaryButtonText: string;
    };
    sectionVisibility?: {
      [key: string]: boolean | undefined;
    };
    sectionStyles?: {
      [key: string]: string | undefined;
    };
  };

  // 3. Tours Page
  tours: {
    hero: {
      tagline: string;
      title: string;
      subtitle: string;
      image?: string;
    };
    proposalCallout: {
      badge: string;
      title: string;
      description: string;
      primaryButtonText?: string;
      secondaryButtonText?: string;
    };
    guaranteesHeader?: {
      tagline: string;
      heading: string;
    };
    guarantees: Array<{
      title: string;
      description: string;
    }>;
    sectionVisibility?: {
      [key: string]: boolean | undefined;
    };
    sectionStyles?: {
      [key: string]: string | undefined;
    };
  };


  // 4. Proposal Package Page
  proposal: {
    hero: {
      tagline: string;
      title: string;
      subtitle: string;
    };
    overview: {
      heading: string;
      tagline: string;
      paragraph1: string;
      paragraph2: string;
      image: string;
      primaryButtonText?: string;
      secondaryButtonText?: string;
    };
    pillars: {
      heading: string;
      subtitle: string;
      items: Array<{
        title: string;
        description: string;
        image: string;
      }>;
    };
    timeline: {
      heading: string;
      tagline: string;
      subtitle: string;
      steps: Array<{
        step: string;
        time: string;
        title: string;
        description: string;
      }>;
    };
    faqs: {
      heading: string;
      items: Array<{
        question: string;
        answer: string;
      }>;
    };
    sectionVisibility?: {
      [key: string]: boolean | undefined;
    };
    sectionStyles?: {
      [key: string]: string | undefined;
    };
  };


  // 5. Explore Ratnapura Page
  explore: {
    hero: {
      tagline: string;
      title: string;
      subtitle: string;
      image?: string;
    };
    catalogHeader?: {
      badge: string;
      heading: string;
      subtitle: string;
    };
    intro: {
      heading: string;
      description: string;
    };
    sectionVisibility?: {
      [key: string]: boolean | undefined;
    };
    sectionStyles?: {
      [key: string]: string | undefined;
    };
  };


  // 6. Articles & Journal Page
  articles: {
    hero: {
      tagline: string;
      title: string;
      subtitle: string;
      image?: string;
    };
    listHeader?: {
      tagline: string;
      heading: string;
    };
    sectionVisibility?: {
      [key: string]: boolean | undefined;
    };
    sectionStyles?: {
      [key: string]: string | undefined;
    };
  };


  // 7. Contact Us & Global Site Settings
  contact: {
    hero: {
      tagline: string;
      title: string;
      subtitle: string;
      image?: string;
    };
    primaryPhone: string;
    secondaryPhone: string;
    primaryEmail: string;
    physicalAddress: string;
    openingHoursWeekdays: string;
    openingHoursWeekends: string;
    whatsappNumber: string;
    map?: {
      badge: string;
      heading: string;
      subtitle: string;
      addressText: string;
      directionsUrl?: string;
    };
    faqsHeader?: {
      heading: string;
    };
    faqs?: Array<{
      question: string;
      answer: string;
    }>;
    sectionVisibility?: {
      [key: string]: boolean | undefined;
    };
    sectionStyles?: {
      [key: string]: string | undefined;
    };
  };


  // 8. Footer & Social Links
  footer: {
    brandHeading?: string;
    brandLogo?: string;
    aboutText: string;
    packagesHeading?: string;
    contactHeading?: string;
    partnerLogo?: string;
    partnerTagline?: string;
    facebookUrl: string;
    instagramUrl: string;
    youtubeUrl: string;
    tripadvisorUrl: string;
    googleMapsUrl?: string;
    copyrightText: string;
    poweredByText?: string;
    poweredByUrl?: string;
    sectionVisibility?: {
      [key: string]: boolean | undefined;
    };
    sectionStyles?: {
      [key: string]: string | undefined;
    };
  };
}


export const SECTION_COLOR_THEMES = [
  { id: 'default', label: 'Default (Original Section Tone)', bgClass: '', desc: 'Original section styling' },
  { id: 'color-a', label: 'Color A: Standard Background', bgClass: 'bg-background text-foreground', desc: 'Clean standard background tone' },
  { id: 'color-b', label: 'Color B: Alternate Contrast', bgClass: 'bg-muted/40 border-y border-border/50 text-foreground', desc: 'Soft alternating contrast tone' },
  { id: 'dark', label: 'Dark Accent (Slate 950)', bgClass: 'bg-slate-950 text-white border-y border-white/10', desc: 'Deep luxury dark section' },
] as const;


export function getSectionThemeClass(themeId?: string, defaultClass: string = ''): string {
  if (!themeId || themeId === 'default') return defaultClass;
  const found = SECTION_COLOR_THEMES.find(t => t.id === themeId);
  return found ? `${found.bgClass} ${defaultClass}` : defaultClass;
}

export const defaultSiteContent: SiteContentData = {

  homepage: {
    hero: {
      tagline: 'THE OFFICIAL SRI LANKA GEM MINE TOUR • RATNAPURA',
      headlineLine1: 'Sri Lanka Gem Mine Tour',
      headlineLine2: 'AN EXCLUSIVE LUXURY EXPERIENCE',
      subheadline: "Discover the world's finest Ceylon sapphires with Sri Lanka's premier luxury gem mine tour. Private active pit descent, river washing, and licensed gemologists.",
      ctaPrimaryText: 'Book Your Experience',
      ctaSecondaryText: 'Explore Packages',
      videoUrl: 'https://content-provider.payshia.com/sapphire-trail/hero/hero-video-sapphire-trail.webm',
      posterImageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
    },
    stats: [
      { value: '5,000+', label: 'Happy Guests' },
      { value: '27+', label: 'Years Hospitality Excellence' },
      { value: '100%', label: 'Safety Record' },
      { value: '50+', label: 'Active Mine Pits Accessed' },
    ],
    journey: {
      tagline: 'The Signature Gemological Trail',
      heading: 'The 4-Step Expedition Journey',
      subtitle: 'From subterranean timber-reinforced shafts to the world-famous street trading bazaar, experience every stage of Ceylon sapphire heritage.',
      steps: [
        {
          step: '01',
          title: 'Descend into Active Mining Pits',
          subtitle: 'Authentic Underground Experience',
          description: 'Equipped with safety gear, descend into real 40–60ft traditional timbered mine shafts. Meet veteran miners and witness ancient hand-drilling methods in action.',
          image: 'https://content-provider.payshia.com/sapphire-trail/images/tour-3-optimized.webp',
        },
        {
          step: '02',
          title: 'Traditional Gem Gravel Washing',
          subtitle: 'Hands-on Illama Washing',
          description: 'Stand alongside local miners in mountain stream beds. Master the ancient technique of swirling conical bamboo baskets to separate heavy sapphire gravel from silt.',
          image: 'https://content-provider.payshia.com/sapphire-trail/images/tour-4-optimized.webp',
        },
        {
          step: '03',
          title: 'Ratnapura Street Gem Market',
          subtitle: "The World's Sapphire Capital",
          description: 'Step into the bustling alleys of Ratnapura where rough gemstones are traded using secret hand signals and optical torches in a centuries-old open-air bazaar.',
          image: 'https://content-provider.payshia.com/sapphire-trail/images/tour-7-optimized.webp',
        },
        {
          step: '04',
          title: 'Gemologist Valuation & Workshop',
          subtitle: 'Authentication & Lapidary',
          description: 'Conclude at our partner laboratory at Grand Silver Ray. Examine raw Ceylon Sapphires, Padparadschas, and Star stones under high-power microscopes.',
          image: 'https://content-provider.payshia.com/sapphire-trail/images/tour-8-optimized.webp',
        }
      ]
    },
    discover: {
      tagline: 'Authentic Ratnapura Exploration',
      heading: 'Discover Our Gem Mine Tours',
      description: "Get more than just a glimpse of this captivating world with our unique Gem Mine Tours. In the heart of Ratnapura, Sri Lanka—the legendary 'City of Gems'—this authentic gemstone tour takes you into actual mining pits. Discover the ancient tradition behind world-famous Ceylon Sapphires, guided by experts. It's a rich experience far beyond the usual tourist trail.",
      images: [
        { 
          src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-1-optimized.webp', 
          alt: 'A tourist gets fitted with a safety harness before a gem tour.', 
          hint: 'gem tour safety',
          hoverDescription: 'Prepare for an authentic Gem Mine Tour. Safety and adventure go hand-in-hand as you get ready to descend into a real mine.'
        },
        { 
          src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-2-optimized.webp', 
          alt: 'A happy tourist smiles while holding his helmet straps during a gem mine tour.', 
          hint: 'happy tourist gem tour',
          hoverDescription: 'The thrill of discovery on our Gem Tour. This hands-on experience is what makes our gem tours unforgettable.'
        },
        { 
          src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-3-optimized.webp', 
          alt: 'A miner works inside a dimly lit, traditional gem mine.', 
          hint: 'traditional gem mine',
          hoverDescription: 'Deep inside a traditional mine. This is the heart of our Gem Mine Tour, showcasing the authentic mining process.'
        },
        { 
          src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-4-optimized.webp', 
          alt: 'A couple examines a glowing gemstone with a light tool.', 
          hint: 'examining gemstone',
          hoverDescription: 'Inspecting a freshly found sapphire. Every Gem Tour concludes with a close-up look at these precious stones.'
        },
        { 
          src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-5-optimized.webp', 
          alt: 'A person holds a piece of paper with several rough gemstones on it.', 
          hint: 'rough gemstones hand',
          hoverDescription: 'The rewards of a successful Gem Mine Tour. Hold raw, uncut sapphires straight from the earth.'
        },
        { 
          src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-6-optimized.webp', 
          alt: 'A tourist gives a thumbs-up while wearing a hard hat.', 
          hint: 'tourist thumbs up',
          hoverDescription: 'An unforgettable adventure. Our guests love the unique access provided by our expert-led Gem Tour.'
        },
        { 
          src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-7-optimized.webp', 
          alt: 'A person sharpens a tool on a traditional gem cutting wheel.', 
          hint: 'gem cutting wheel',
          hoverDescription: 'The art of transformation. Witness traditional gem cutting, a key part of the complete Gem Mine Tour experience.'
        },
        { 
          src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-8-optimized.webp', 
          alt: 'A gemologist sorts and grades small gemstones at a well-lit desk.', 
          hint: 'gemologist sorting gems',
          hoverDescription: 'From rough stone to finished jewel. Our gemologists explain the sorting process, an essential part of every Gem Tour.'
        },
      ]
    },
    toursHeader: {
      tagline: 'Private VIP Itineraries',
      heading: 'Curated Gem Mine Tours',
      subtitle: 'All-inclusive private expeditions with certified gemologists, pit descents, river washing, and luxury transfers.'
    },
    reviewsHeader: {
      tagline: 'Verified Guest Experiences',
      heading: 'What Discerning Travelers Say',
      subtitle: 'Read authentic impressions from international collectors, couples, and adventurers who explored the mines with us.'
    },
    exploreHeader: {
      tagline: 'Beyond The Mining Pits',
      heading: 'Explore Ratnapura & Surrounding Wonders',
      subtitle: 'From ancient gem markets and tea plantations to rainforest sanctuaries and sacred shrines in Sabaragamuwa.'
    },
    faqHeader: {
      tagline: 'Everything You Need To Know',
      heading: 'Frequently Asked Questions',
      subtitle: 'Expert answers on safety equipment, physical requirements, children protocols, and customized tour logistics.'
    },
    articlesHeader: {
      tagline: 'Field Journal & Lore',
      heading: 'Stories from the Mines of Ceylon',
      subtitle: 'Authoritative guides on Ceylon sapphire valuation, heat treatments, padparadscha lore, and lapidary cutting.'
    },
    subscription: {
      tagline: 'Insider Gemological Knowledge',
      heading: 'Download the Official 2026 Ceylon Sapphire Field Guide',
      subheadline: 'Get our comprehensive 30-page handbook on gemstone identification, mine safety, street market negotiation, and certified valuation standards directly to your inbox.',
      buttonText: 'Get Free Field Guide',
    },
    sectionVisibility: {},
    sectionStyles: {},
  },


  about: {
    // 1. Hero
    hero: {
      tagline: "The Guardians of Ceylon's Sapphire Legacy",
      title: 'About Sapphire Trails',
      subtitle: "Backed by 27+ years of hospitality excellence at Grand Silver Ray, we lead ethical, VIP gemological journeys into Sri Lanka's most legendary sapphire mines.",
      image: 'https://content-provider.payshia.com/sapphire-trail/images/tour-11-optimized.webp',
    },
    // 2. Metrics
    metrics: [
      { value: '27+', label: 'Years Hospitality Heritage', description: 'Backed by the iconic Grand Silver Ray resort in Ratnapura' },
      { value: '100%', label: 'Ethical & Conflict-Free', description: 'Direct sourcing with fair artisan wages & environmental restoration' },
      { value: '15+', label: 'Partner Active Mines', description: 'Exclusive private pit access unavailable to standard mass tours' },
      { value: '4.9★', label: 'Guest Satisfaction', description: 'Unrivaled private tour ratings from discerning global travelers' },
    ],
    // 3. Our Story
    story: {
      tagline: 'Our Heritage & Origins',
      heading: 'From 27 Years of Hospitality to the Birth of Sapphire Trails',
      paragraph1: "Our journey is deeply rooted in Ratnapura—the legendary 'City of Gems' in Sri Lanka's Sabaragamuwa province. For over 27 years, our parent establishment, Grand Silver Ray, has welcomed global dignitaries, connoisseurs, and adventurers, establishing the gold standard in regional hospitality.",
      paragraph2: "However, we observed that most travelers visiting Sri Lanka only experienced gemstones behind glass display cases. The true magic—the ancient rhythm of timber pit mining and raw sapphire discovery—remained hidden.",
      quote: "Sapphire Trails was founded on a singular conviction: to bridge world-class luxury hospitality with authentic, ethical, and safe gem exploration directly at the source.",
      image: 'https://content-provider.payshia.com/sapphire-trail/images/tour-4-optimized.webp',
      image2: 'https://content-provider.payshia.com/sapphire-trail/images/tour-2-optimized.webp',
      image3: 'https://content-provider.payshia.com/sapphire-trail/images/tour-6-optimized.webp',
      badge1: { year: 'EST. 1997', title: 'Hospitality Roots', desc: 'Grand Silver Ray founded as Ratnapura’s premier landmark resort.' },
      badge2: { year: 'EST. 2015', title: 'Ethical Mine Alliances', desc: 'Securing exclusive partnerships with certified artisan mining families.' },
      badge3: { year: 'TODAY', title: 'Global Gem Tours', desc: 'Sri Lanka’s highest rated VIP gemological tour operator.' },
    },

    // 4. Experience
    experience: {
      tagline: 'The Signature Trail',
      heading: 'The Sapphire Trails Experience',
      description: 'A true luxury gem tour is a multi-faceted experience. It’s about the thrill of the hunt, the connection to culture, and the comfort of world-class hospitality, all woven into one unforgettable adventure.',
      items: [
        {
          title: 'Authentic Gem Mining',
          description: 'Experience the thrill of the hunt with hands-on gem mining adventures led by local experts in the heart of Ratnapura.',
          image: 'https://content-provider.payshia.com/sapphire-trail/images/tour-1-optimized.webp',
        },
        {
          title: 'Luxury Stays',
          description: 'Unwind in serene, architecturally iconic suites at the Grand Silver Ray, our exclusive hospitality partner.',
          image: 'https://content-provider.payshia.com/silver-ray/room-images/89/BEDROOM-1-optimized-69470fe99fc4c.webp',
        },
        {
          title: 'Expert Workshops',
          description: 'Engage in private sapphire selection and traditional gem cutting workshops with our certified gemologists.',
          image: 'https://content-provider.payshia.com/sapphire-trail/images/tour-7-optimized.webp',
        },
        {
          title: 'Cultural Immersions',
          description: 'Beyond the mines, enjoy curated tea estate tours, local culinary experiences, and excursions to cultural landmarks.',
          image: 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp',
        },
      ]
    },
    // 5. Core Values
    values: {
      tagline: 'Guiding Principles',
      heading: 'Rooted in Integrity, Safety & Sustainable Heritage',
      subtitle: 'We believe exceptional gemological travel should empower local artisan communities while preserving the fragile ecosystem of Ratnapura.',
      items: [
        {
          title: 'Ethical Mine Alliances',
          badge: 'Fair Trade & Artisans',
          description: 'We partner exclusively with certified, government-licensed family pits. We ensure artisan miners receive fair wages, healthcare support, and dignified working conditions without middleman exploitation.',
          points: [
            '100% Government Licensed Pits (NGJA)',
            'Direct artisan profit sharing',
            'Strict zero child-labor policy'
          ]
        },
        {
          title: 'Eco Land Restoration',
          badge: 'Sustainable Heritage',
          description: 'The beauty of gemstones must not come at nature’s expense. Following extraction, every pit we support undergoes systematic land backfilling, topsoil rejuvenation, and native reforestation.',
          points: [
            'Zero chemical mining methods',
            'Paddy field & waterway preservation',
            'Active tree replanting initiatives'
          ]
        },
        {
          title: 'VIP Safety Protocols',
          badge: 'International Standards',
          description: 'Unlike informal or hazardous tours, our expeditions follow rigorous engineering safety guidelines. We provide professional PPE, timber shaft stabilization audits, and full liability coverage.',
          points: [
            'Safety helmets, harnesses & boots provided',
            'Structural pit safety inspection',
            '24/7 Concierge & medical backup'
          ]
        },
        {
          title: 'Certified Authenticity',
          badge: 'NGJA & GIA Standards',
          description: 'Every gemstone viewed or acquired on our tours is evaluated by licensed gemologists with complete chain-of-custody documentation and official National Gem and Jewellery Authority certificates.',
          points: [
            'Independent laboratory testing',
            'Conflict-free origin verification',
            'Transparent valuation & pricing'
          ]
        },
      ]

    },
    // 6. 4-Stage Sapphire Journey
    gemJourney: {
      tagline: 'Mine to Masterpiece',
      heading: 'The 4-Stage Sapphire Journey',
      subtitle: 'Witness how a raw crystal buried 50 feet underground becomes a timeless royal treasure.',
      steps: [
        {
          step: '01',
          title: 'The Traditional Shaft Dig',
          description: 'Artisan miners descend 30 to 80 feet using timbered vertical shafts to reach the gemstone-rich Illama gravel layer.',
          image: 'https://content-provider.payshia.com/sapphire-trail/images/tour-1-optimized.webp'
        },
        {
          step: '02',
          title: 'River Gravel Washing',
          description: 'Using conical cane baskets (Garilla), miners wash gravels in running streams to separate heavy sapphire crystals from river sediment.',
          image: 'https://content-provider.payshia.com/sapphire-trail/images/tour-6-optimized.webp'
        },
        {
          step: '03',
          title: 'Master Lapidary Faceting',
          description: 'Generational cutters analyze crystal optical axes and facet rough stones using traditional wooden gem wheels for maximum fire.',
          image: 'https://content-provider.payshia.com/sapphire-trail/images/tour-7-optimized.webp'
        },
        {
          step: '04',
          title: 'Certified Setting & Certification',
          description: 'Master goldsmiths hand-set Ceylon sapphires in bespoke 18K gold and platinum with NGJA and GIA authentication.',
          image: 'https://content-provider.payshia.com/sapphire-trail/images/tour-8-optimized.webp'
        },
      ]
    },
    // 7. Why Ratnapura
    whyRatnapura: {
      tagline: "The World's Gem Capital",
      heading: 'Why Ratnapura: The World’s Sapphire Epicenter',
      paragraph1: "In Sinhala, Ratna (Gem) and Pura (City) translate directly to 'The City of Gems'. Nestled beneath the sacred peak of Sri Pada (Adam’s Peak), Ratnapura boasts unique metamorphic geological formations formed over 500 million years ago.",
      paragraph2: 'For over 2,500 years, the fertile alluvial valleys of Ratnapura have yielded the world’s most celebrated gems, from King Solomon’s treasures to Princess Diana’s iconic Ceylon sapphire engagement ring.',
      quote: "Ratnapura produces more varieties of rare corundum than any single geographical basin on planet Earth.",
      factTitle: 'Royal Heritage',
      factDesc: 'Provider of sapphires to British, European, and Asian royal dynasties for over 2,000 years.',
      image: 'https://content-provider.payshia.com/sapphire-trail/images/tour-11-optimized.webp',
    },
    // 8. Trust & Accreditations
    trustStrip: {
      heading: 'Official Accreditations & Government Compliance',
      badge1: 'National Gem & Jewellery Authority (NGJA) Licensed',
      badge2: 'Sri Lanka Tourism Development Authority (SLTDA) Approved',
      badge3: '100% Certified Ethical Conflict-Free Sourcing',
      badge4: 'Full Liability Insurance & VIP Safety Protocols',
    },
    // 9. Executive CTA
    cta: {
      tagline: 'Curate Your Once-in-a-Lifetime Adventure',
      heading: 'Ready to Walk the Storied Trails of Royal Ceylon Sapphires?',
      subtitle: 'Whether you seek a private single-day mining excursion or an all-inclusive VIP multi-day gemological vacation with luxury resort suites, our concierges are ready to craft your bespoke itinerary.',
      primaryButtonText: 'Book Your Private Gem Tour',
      secondaryButtonText: 'Chat on WhatsApp (+94 71 235 7700)',
    },
    sectionVisibility: {},
    sectionStyles: {},
  },


  // 3. Tours Page
  tours: {
    hero: {
      tagline: 'Private VIP Gemological Expeditions',
      title: 'Curated Gem Mine Tours',
      subtitle: 'Step into active, timber-lined sapphire pits, wash raw river gravels, and hand-select certified Ceylon sapphires guided by licensed senior gemologists.',
      image: 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
    },
    proposalCallout: {
      badge: 'Special Experience',
      title: 'Custom Proposal Package & Bespoke 5-Day Ring Crafting',
      description: 'Looking for the ultimate romantic proposal? Embark on an exclusive Ratnapura gem mine tour, pick your certified natural sapphire with master gemologists, and receive your custom-designed 3D CAD engagement ring in just 5 working days with insured delivery.',
      primaryButtonText: 'Explore Proposal Package',
      secondaryButtonText: 'WhatsApp Concierge',
    },
    guaranteesHeader: {
      tagline: 'The Sapphire Trails Standard',
      heading: "What's Included in Every Private Tour",
    },
    guarantees: [
      { title: '100% Private & Safe', description: 'Never merged with external groups. You receive dedicated private access, safety gear, and licensed supervision.' },
      { title: 'Active Pit Mine Descent', description: 'Authentic timber-lined mining pits in Ratnapura, accompanied by seasoned local artisan miners.' },
      { title: 'Senior Gemologist Guide', description: 'Learn direct optical sorting, color grading, and rough sapphire identification with licensed professionals.' },
      { title: 'VIP Chauffeur Transport', description: 'Complimentary luxury AC transfers available from Colombo, Bandaranaike Airport (CMB), Galle, or Kandy.' },
    ],
    sectionVisibility: {
      hero: true,
      proposalCallout: true,
      grid: true,
      guarantees: true,
      faqs: true,
    },
    sectionStyles: {
      hero: 'default',
      proposalCallout: 'default',
      grid: 'default',
      guarantees: 'default',
      faqs: 'default',
    },
  },


  proposal: {
    hero: {
      tagline: '5-Day Atelier Engagement Ring Crafting',
      title: 'Custom Proposal & Bespoke Ring Package',
      subtitle: 'Embark on a private VIP gem mine tour in Ratnapura, select your certified Ceylon sapphire directly at the source, and receive your handcrafted engagement ring in 5 working days.',
    },
    overview: {
      heading: 'A Romantic Journey in the City of Gems',
      tagline: 'GEM TOUR • BESPOKE RING • 5-DAY DELIVERY',
      paragraph1: 'Make your marriage proposal truly unforgettable with our exclusive bespoke package. Begin with a private VIP expedition to the world-renowned gem mines of Ratnapura. With guidance from certified gemologists, select your natural, ethically sourced Ceylon Sapphire directly at the source.',
      paragraph2: 'Collaborate with master designers on custom 3D CAD modeling tailored to your partner’s style. Our atelier goldsmiths precision-craft, stone-set, and hallmark your bespoke ring in just 5 working days, followed by discreet, insured delivery to your resort or proposal venue.',
      image: 'https://content-provider.payshia.com/sapphire-trail/images/tour-7-optimized.webp',
      primaryButtonText: 'Inquire For Custom Quote',
      secondaryButtonText: 'WhatsApp Concierge',
    },
    pillars: {
      heading: 'The 4 Pillars of Your Proposal Journey',
      subtitle: 'From ethical mining pits in Ratnapura to an exquisite custom engagement ring delivered in 5 working days.',
      items: [
        {
          title: 'Ratnapura Mine Expedition',
          description: 'Private VIP tour to active sapphire mines. Descend safely into a traditional pit and experience hands-on gem gravel washing.',
          image: 'https://content-provider.payshia.com/sapphire-trail/images/tour-1-optimized.webp',
        },
        {
          title: '1-on-1 Gem Selection',
          description: 'Private consultation in our luxury gem lounge. Choose from certified natural Ceylon sapphires with government NGJA/GIA certificates.',
          image: 'https://content-provider.payshia.com/sapphire-trail/images/tour-7-optimized.webp',
        },
        {
          title: '5-Day Master Crafting',
          description: '3D CAD digital rendering and precision hand-setting by generational Sri Lankan goldsmiths in 5 working days.',
          image: 'https://content-provider.payshia.com/sapphire-trail/images/tour-11-optimized.webp',
        },
        {
          title: 'Insured White-Glove Delivery',
          description: 'Discreet, fully insured hand delivery directly to your luxury hotel, villa, or proposal venue across Sri Lanka.',
          image: 'https://content-provider.payshia.com/silver-ray/room-images/89/BEDROOM-1-optimized-69470fe99fc4c.webp',
        },
      ]
    },
    timeline: {
      heading: 'From Mine To Ring In 5 Days',
      tagline: 'THE 5-STAGE JOURNEY',
      subtitle: 'A seamless romantic experience where you source your dream gemstone together at the origin and have it custom-crafted by master jewelers in 5 working days.',
      steps: [
        {
          step: 'Day 1 (Morning)',
          time: 'Step 01',
          title: 'Private Mine Tour & Sourcing Expedition',
          description: 'Begin your romantic journey with a private VIP tour to our ethical sapphire mines in Ratnapura. Descend safely into a traditional pit, witness natural illam gravel extraction, and learn centuries-old washing traditions firsthand.',
        },
        {
          step: 'Day 1 (Afternoon)',
          time: 'Step 02',
          title: '1-on-1 Gem Selection with Certified Gemologists',
          description: 'Sit down in our private VIP gem lounge at Grand Silver Ray. Browse an exquisite collection of ethically mined Ceylon Sapphires (Royal Blue, Padparadscha, Pink, Yellow, Ruby) with official NGJA/GIA certificates.',
        },
        {
          step: 'Day 2',
          time: 'Step 03',
          title: 'Bespoke 3D CAD Ring Designing',
          description: 'Collaborate with our jewelry design team to translate your vision into a custom ring. Select your metal (18K White/Yellow/Rose Gold or Platinum 950) and approve a photorealistic 3D digital model before production.',
        },
        {
          step: 'Days 2 – 5',
          time: 'Step 04',
          title: '5-Day Fast-Track Master Manufacturing',
          description: 'Our generational goldsmiths precision-cast, hand-set, and mirror-polish your engagement ring in our local high-tech atelier with rigorous quality control, laser hallmarking, and gem certification.',
        },
        {
          step: 'Day 5+',
          time: 'Step 05',
          title: 'Insured Delivery & Proposal Concierge',
          description: 'Your completed bespoke ring is placed in a luxury lighted presentation box with full certificates and securely hand-delivered to your luxury hotel, villa, or proposal venue in Sri Lanka (or express-shipped worldwide).',
        },
      ]
    },
    faqs: {
      heading: 'Proposal Package FAQ',
      items: [
        {
          question: 'How are you able to design and handcraft a bespoke ring in just 5 working days?',
          answer: 'Ratnapura is the world epicenter of Ceylon gem mining and master lapidaries. Because our atelier, master 3D CAD designers, stone setters, and government gem testing labs operate in close coordination locally, we eliminate the 4-8 week overseas shipping and middleman delays common in Western retail jewelry.',
        },
        {
          question: 'Are the sapphires and gemstones certified for authenticity?',
          answer: 'Yes, 100%. Every gemstone sourced during your tour comes with official certification from accredited institutions such as the National Gem and Jewellery Authority of Sri Lanka (NGJA), GIC, or international laboratories verifying its natural Ceylon origin and authentic treatments/unheated status.',
        },
        {
          question: 'Can we surprise my partner during the tour, or do we design it together?',
          answer: 'Both options are popular! You can secretly coordinate the design and ring manufacturing with us prior to arrival and surprise her during the Ratnapura mine tour/romantic dinner. Alternatively, you can bring her on the tour to choose her favorite gemstone, and we deliver the crafted ring to your hotel/beach villa on Day 5 before you depart Sri Lanka.',
        },
        {
          question: 'How does delivery work in Sri Lanka or internationally?',
          answer: 'For clients in Sri Lanka, we provide discreet, fully insured white-glove hand delivery directly to your luxury hotel, villa, or designated proposal venue. For international clients, we offer fully insured express courier shipping.',
        },
        {
          question: 'What precious metals can we choose from?',
          answer: 'We offer 18K White Gold, 18K Yellow Gold, 18K Rose Gold, and Platinum 950. All metal is hallmarked and tested for purity.',
        },
      ]
    },
    sectionVisibility: {},
    sectionStyles: {},
  },


  explore: {
    hero: {
      tagline: 'City of Gems Discovery Guide',
      title: 'Explore Ratnapura',
      subtitle: 'Discover ancient sapphire trading markets, revered temples, cascading waterfalls, and lush tea estates in the Sabaragamuwa province.',
      image: 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp',
    },
    catalogHeader: {
      badge: 'Curated Destinations',
      heading: 'Discover Ratnapura Attractions',
      subtitle: 'From world-famous alluvial gem gravel pits to virgin rainforest sanctuaries and sacred temples.',
    },
    intro: {
      heading: 'The Ancient City of Precious Gems',
      description: 'Ratnapura, meaning "City of Gems" in Sanskrit, has been the epicentre of global gemstone commerce for over two millennia. Nestled amidst misty mountain ranges, it offers travelers an unforgettable blend of active mining culture, pristine rainforests, and historic heritage.',
    },
    sectionVisibility: {
      hero: true,
      catalog: true,
      intro: true,
    },
    sectionStyles: {
      hero: 'default',
      catalog: 'default',
      intro: 'default',
    },
  },


  articles: {
    hero: {
      tagline: 'Official Field Journal & Gemology Guides',
      title: 'Stories from the Mines of Ceylon',
      subtitle: 'Your premier resource for Ceylon sapphire grading, traditional pit mining heritage, and insider Ratnapura expedition guides.',
      image: 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp',
    },
    listHeader: {
      tagline: 'Field Journal & Guides',
      heading: 'Explore Articles & Insights',
    },
    sectionVisibility: {
      hero: true,
      list: true,
    },
    sectionStyles: {
      hero: 'default',
      list: 'default',
    },
  },


  contact: {
    hero: {
      tagline: '24/7 Concierge & Inquiries',
      title: 'Contact Us',
      subtitle: 'Connect with our gemological expedition specialists to plan your private tour, bespoke gemstone acquisition, or luxury suite reservations in Ratnapura.',
      image: 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
    },
    primaryPhone: '071 235 7700',
    secondaryPhone: '071 638 1000',
    primaryEmail: 'info@sapphiretrails.lk',
    physicalAddress: 'Grand Silver Ray, Colombo - Batticaloa Hwy, Ratnapura, Sri Lanka',
    openingHoursWeekdays: '08:00 AM – 06:00 PM',
    openingHoursWeekends: '09:00 AM – 04:00 PM',
    whatsappNumber: '94712357700',
    map: {
      badge: 'Visit Sapphire Trails',
      heading: 'Our Headquarters & Tour Lounge',
      subtitle: 'Conveniently situated at Grand Silver Ray on the Colombo-Batticaloa Highway, Ratnapura.',
      addressText: 'Grand Silver Ray, Colombo - Batticaloa Hwy, Ratnapura 70070, Sri Lanka',
      directionsUrl: 'https://maps.app.goo.gl/uX3rK6fDpzQZ6mZ46',
    },
    faqsHeader: {
      heading: 'Frequently Asked Questions',
    },
    faqs: [
      {
        question: "What is Sapphire Trail Professional Gem Mining Tour?",
        answer: "The Sapphire Trails Professional Gem Mining Tour offers an extraordinary journey into the heart of Sri Lanka's legendary gem industry, wrapped in the warmth of authentic Sri Lankan hospitality. This premium travel experience seamlessly blends discovery with indulgence, offering exquisite food and beverages, luxurious accommodations, and comfortable transportation."
      },
      {
        question: "Do I need experience to participate?",
        answer: "No experience is required. Our tours are beginner-friendly and guided by knowledgeable staff who will teach you how to identify and clean your finds."
      },
      {
        question: "How long does a tour last?",
        answer: "Most tours last between 06 to 08 hours. Private or extended experiences may be available upon request."
      },
      {
        question: "Who can participate in this tour?",
        answer: "Any local or foreign tourist can participate. However, only visitors in good physical condition can enter the mine."
      },
      {
        question: "How do I make a reservation?",
        answer: "You can make a reservation through our official website www.sapphiretrails.lk. You can also reserve your spot by contacting our Hotline at 0712357700 or 0716381000, or by sending an email to info@sapphiretrails.com."
      },
    ],
    sectionVisibility: {
      hero: true,
      channels: true,
      map: true,
      faqs: true,
      tours: true,
    },
    sectionStyles: {
      hero: 'default',
      channels: 'default',
      map: 'default',
      faqs: 'default',
      tours: 'default',
    },
  },


  footer: {
    brandHeading: 'SAPPHIRE TRAILS',
    brandLogo: '/img/logo4.png',
    aboutText: 'Sapphire Trails offers exclusive Gem Mine Tours in Ratnapura, Sri Lanka. Experience the complete journey from traditional mining pits to the gem market with our expert guides.',
    packagesHeading: 'TOUR PACKAGES',
    contactHeading: 'CONTACT US',
    partnerLogo: '/img/logo2.png',
    partnerTagline: 'Our Hospitality Partner for Luxury Gem Tours.',
    facebookUrl: 'https://www.facebook.com/p/Sapphire-Trails-61573050367074/',
    instagramUrl: 'https://instagram.com',
    youtubeUrl: 'https://youtube.com',
    tripadvisorUrl: 'https://tripadvisor.com',
    googleMapsUrl: 'https://maps.app.goo.gl/h562367TWEDda77J8',
    copyrightText: '© 2026 Sapphire Trails. All rights reserved.',
    poweredByText: 'Powered by Nebulync.com',
    poweredByUrl: 'https://nebulync.com',
    sectionVisibility: {
      brand: true,
      packages: true,
      contact: true,
      partner: true,
      bottom: true,
    },
    sectionStyles: {
      footer: 'default',
    },
  }
};


const SITE_CONTENT_STORAGE_KEY = 'sapphire_site_content_cache';
const SITE_CONTENT_CHANGE_EVENT = 'sapphire_site_content_updated';

export function mergeProposalContent(parsedProposal?: any) {
  const d = defaultSiteContent.proposal;
  if (!parsedProposal || typeof parsedProposal !== 'object') return d;

  const rawPillars = parsedProposal.pillars;
  let pillarItems = d.pillars.items;
  let pillarHeading = d.pillars.heading;
  let pillarSubtitle = d.pillars.subtitle;

  if (Array.isArray(rawPillars) && rawPillars.length > 0) {
    pillarItems = d.pillars.items.map((defItem, idx) => ({
      ...defItem,
      ...(rawPillars[idx] || {}),
    }));
  } else if (rawPillars && typeof rawPillars === 'object') {
    if (rawPillars.heading) pillarHeading = rawPillars.heading;
    if (rawPillars.subtitle) pillarSubtitle = rawPillars.subtitle;
    if (Array.isArray(rawPillars.items) && rawPillars.items.length > 0) {
      pillarItems = d.pillars.items.map((defItem, idx) => ({
        ...defItem,
        ...(rawPillars.items[idx] || {}),
      }));
    }
  }

  const rawTimeline = parsedProposal.timeline;
  let timelineHeading = d.timeline.heading;
  let timelineTagline = d.timeline.tagline;
  let timelineSubtitle = d.timeline.subtitle;
  let timelineSteps = d.timeline.steps;

  if (rawTimeline && typeof rawTimeline === 'object') {
    if (rawTimeline.heading) timelineHeading = rawTimeline.heading;
    if (rawTimeline.tagline) timelineTagline = rawTimeline.tagline;
    if (rawTimeline.subtitle) timelineSubtitle = rawTimeline.subtitle;
    if (Array.isArray(rawTimeline.steps) && rawTimeline.steps.length > 0) {
      timelineSteps = d.timeline.steps.map((defStep, idx) => ({
        ...defStep,
        ...(rawTimeline.steps[idx] || {}),
      }));
    }
  }

  const rawFaqs = parsedProposal.faqs;
  let faqsHeading = d.faqs.heading;
  let faqsItems = d.faqs.items;

  if (rawFaqs && typeof rawFaqs === 'object') {
    if (rawFaqs.heading) faqsHeading = rawFaqs.heading;
    if (Array.isArray(rawFaqs.items) && rawFaqs.items.length > 0) {
      faqsItems = rawFaqs.items;
    }
  }

  return {
    ...d,
    ...parsedProposal,
    hero: { ...d.hero, ...(parsedProposal.hero || {}) },
    overview: { ...d.overview, ...(parsedProposal.overview || {}) },
    pillars: {
      heading: pillarHeading,
      subtitle: pillarSubtitle,
      items: pillarItems,
    },
    timeline: {
      heading: timelineHeading,
      tagline: timelineTagline,
      subtitle: timelineSubtitle,
      steps: timelineSteps,
    },
    faqs: {
      heading: faqsHeading,
      items: faqsItems,
    },
    sectionVisibility: parsedProposal.sectionVisibility || {},
    sectionStyles: parsedProposal.sectionStyles || {},
  };
}

export function mergeToursContent(parsedTours?: any) {
  const d = defaultSiteContent.tours;
  if (!parsedTours || typeof parsedTours !== 'object') return d;

  const rawGuarantees = parsedTours.guarantees;
  let guarantees = d.guarantees;
  if (Array.isArray(rawGuarantees) && rawGuarantees.length > 0) {
    guarantees = d.guarantees.map((defG, idx) => ({
      ...defG,
      ...(rawGuarantees[idx] || {}),
    }));
  }

  return {
    ...d,
    ...parsedTours,
    hero: { ...d.hero, ...(parsedTours.hero || {}) },
    proposalCallout: { ...d.proposalCallout, ...(parsedTours.proposalCallout || {}) },
    guaranteesHeader: { ...d.guaranteesHeader, ...(parsedTours.guaranteesHeader || {}) },
    guarantees,
    sectionVisibility: { ...d.sectionVisibility, ...(parsedTours.sectionVisibility || {}) },
    sectionStyles: { ...d.sectionStyles, ...(parsedTours.sectionStyles || {}) },
  };
}

export function mergeExploreContent(parsedExplore?: any) {
  const d = defaultSiteContent.explore;
  if (!parsedExplore || typeof parsedExplore !== 'object') return d;

  return {
    ...d,
    ...parsedExplore,
    hero: { ...d.hero, ...(parsedExplore.hero || {}) },
    catalogHeader: { ...d.catalogHeader, ...(parsedExplore.catalogHeader || {}) },
    intro: { ...d.intro, ...(parsedExplore.intro || {}) },
    sectionVisibility: { ...d.sectionVisibility, ...(parsedExplore.sectionVisibility || {}) },
    sectionStyles: { ...d.sectionStyles, ...(parsedExplore.sectionStyles || {}) },
  };
}

export function mergeArticlesContent(parsedArticles?: any) {
  const d = defaultSiteContent.articles;
  if (!parsedArticles || typeof parsedArticles !== 'object') return d;

  return {
    ...d,
    ...parsedArticles,
    hero: { ...d.hero, ...(parsedArticles.hero || {}) },
    listHeader: { ...d.listHeader, ...(parsedArticles.listHeader || {}) },
    sectionVisibility: { ...d.sectionVisibility, ...(parsedArticles.sectionVisibility || {}) },
    sectionStyles: { ...d.sectionStyles, ...(parsedArticles.sectionStyles || {}) },
  };
}

export function mergeContactContent(parsedContact?: any) {
  const d = defaultSiteContent.contact;
  if (!parsedContact || typeof parsedContact !== 'object') return d;

  const rawFaqs = parsedContact.faqs;
  let faqs = d.faqs;
  if (Array.isArray(rawFaqs) && rawFaqs.length > 0) {
    faqs = rawFaqs;
  }

  return {
    ...d,
    ...parsedContact,
    hero: { ...d.hero, ...(parsedContact.hero || {}) },
    map: { ...d.map, ...(parsedContact.map || {}) },
    faqsHeader: { ...d.faqsHeader, ...(parsedContact.faqsHeader || {}) },
    faqs,
    sectionVisibility: { ...d.sectionVisibility, ...(parsedContact.sectionVisibility || {}) },
    sectionStyles: { ...d.sectionStyles, ...(parsedContact.sectionStyles || {}) },
  };
}

export function mergeFooterContent(parsedFooter?: any) {
  const d = defaultSiteContent.footer;
  if (!parsedFooter || typeof parsedFooter !== 'object') return d;

  return {
    ...d,
    ...parsedFooter,
    sectionVisibility: { ...d.sectionVisibility, ...(parsedFooter.sectionVisibility || {}) },
    sectionStyles: { ...d.sectionStyles, ...(parsedFooter.sectionStyles || {}) },
  };
}

export async function fetchSiteContent(): Promise<SiteContentData> {

  try {
    const response = await fetch(`${API_BASE_URL}/content/site_data`, {
      cache: 'no-store',
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data === 'object') {
        const merged: SiteContentData = {
          ...defaultSiteContent,
          ...data,
          homepage: { 
            ...defaultSiteContent.homepage, 
            ...data.homepage,
            hero: { ...defaultSiteContent.homepage.hero, ...(data.homepage?.hero || {}) },
            stats: data.homepage?.stats || defaultSiteContent.homepage.stats,
            journey: { ...defaultSiteContent.homepage.journey, ...(data.homepage?.journey || {}) },
            discover: { ...defaultSiteContent.homepage.discover, ...(data.homepage?.discover || {}) },
            toursHeader: { ...defaultSiteContent.homepage.toursHeader, ...(data.homepage?.toursHeader || {}) },
            reviewsHeader: { ...defaultSiteContent.homepage.reviewsHeader, ...(data.homepage?.reviewsHeader || {}) },
            exploreHeader: { ...defaultSiteContent.homepage.exploreHeader, ...(data.homepage?.exploreHeader || {}) },
            faqHeader: { ...defaultSiteContent.homepage.faqHeader, ...(data.homepage?.faqHeader || {}) },
            articlesHeader: { ...defaultSiteContent.homepage.articlesHeader, ...(data.homepage?.articlesHeader || {}) },
            subscription: { ...defaultSiteContent.homepage.subscription, ...(data.homepage?.subscription || {}) },
          },
          about: { 
            ...defaultSiteContent.about, 
            ...data.about,
            hero: { ...defaultSiteContent.about.hero, ...(data.about?.hero || {}) },
            metrics: data.about?.metrics || defaultSiteContent.about.metrics,
            story: { ...defaultSiteContent.about.story, ...(data.about?.story || {}) },
            experience: { 
              ...defaultSiteContent.about.experience, 
              ...(data.about?.experience || {}),
              items: data.about?.experience?.items || defaultSiteContent.about.experience.items 
            },
            values: { 
              ...defaultSiteContent.about.values, 
              ...(data.about?.values || {}),
              items: (data.about?.values?.items || defaultSiteContent.about.values.items).map((v: any, idx: number) => ({
                ...defaultSiteContent.about.values.items[idx],
                ...v,
                points: (v.points && v.points.length > 0) ? v.points : (defaultSiteContent.about.values.items[idx]?.points || []),
              }))
            },
            gemJourney: {
              ...defaultSiteContent.about.gemJourney,
              ...(data.about?.gemJourney || {}),
              steps: (data.about?.gemJourney?.steps || defaultSiteContent.about.gemJourney.steps).map((s: any, idx: number) => ({
                ...defaultSiteContent.about.gemJourney.steps[idx],
                ...s,
              }))
            },
            whyRatnapura: { ...defaultSiteContent.about.whyRatnapura, ...(data.about?.whyRatnapura || {}) },
            trustStrip: { ...defaultSiteContent.about.trustStrip, ...(data.about?.trustStrip || {}) },
            cta: { ...defaultSiteContent.about.cta, ...(data.about?.cta || {}) },
          },
          tours: mergeToursContent(data.tours),
          proposal: mergeProposalContent(data.proposal),
          explore: mergeExploreContent(data.explore),
          articles: mergeArticlesContent(data.articles),
          contact: mergeContactContent(data.contact),
          footer: mergeFooterContent(data.footer),
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(SITE_CONTENT_STORAGE_KEY, JSON.stringify(merged));
        }
        return merged;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch dynamic site content, using cache/fallback', err);
  }

  // Fallback to localStorage cache if client-side
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(SITE_CONTENT_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return {
          ...defaultSiteContent,
          ...parsed,
          homepage: {
            ...defaultSiteContent.homepage,
            ...(parsed.homepage || {}),
            hero: { ...defaultSiteContent.homepage.hero, ...(parsed.homepage?.hero || {}) },
            stats: parsed.homepage?.stats || defaultSiteContent.homepage.stats,
            journey: { ...defaultSiteContent.homepage.journey, ...(parsed.homepage?.journey || {}) },
            discover: { ...defaultSiteContent.homepage.discover, ...(parsed.homepage?.discover || {}) },
            toursHeader: { ...defaultSiteContent.homepage.toursHeader, ...(parsed.homepage?.toursHeader || {}) },
            reviewsHeader: { ...defaultSiteContent.homepage.reviewsHeader, ...(parsed.homepage?.reviewsHeader || {}) },
            exploreHeader: { ...defaultSiteContent.homepage.exploreHeader, ...(parsed.homepage?.exploreHeader || {}) },
            faqHeader: { ...defaultSiteContent.homepage.faqHeader, ...(parsed.homepage?.faqHeader || {}) },
            articlesHeader: { ...defaultSiteContent.homepage.articlesHeader, ...(parsed.homepage?.articlesHeader || {}) },
            subscription: { ...defaultSiteContent.homepage.subscription, ...(parsed.homepage?.subscription || {}) },
          },
          about: {
            ...defaultSiteContent.about,
            ...(parsed.about || {}),
            hero: { ...defaultSiteContent.about.hero, ...(parsed.about?.hero || {}) },
            metrics: parsed.about?.metrics || defaultSiteContent.about.metrics,
            story: { ...defaultSiteContent.about.story, ...(parsed.about?.story || {}) },
            experience: { 
              ...defaultSiteContent.about.experience, 
              ...(parsed.about?.experience || {}),
              items: parsed.about?.experience?.items || defaultSiteContent.about.experience.items 
            },
            values: { 
              ...defaultSiteContent.about.values, 
              ...(parsed.about?.values || {}),
              items: (parsed.about?.values?.items || defaultSiteContent.about.values.items).map((v: any, idx: number) => ({
                ...defaultSiteContent.about.values.items[idx],
                ...v,
                points: (v.points && v.points.length > 0) ? v.points : (defaultSiteContent.about.values.items[idx]?.points || []),
              }))
            },
            gemJourney: {
              ...defaultSiteContent.about.gemJourney,
              ...(parsed.about?.gemJourney || {}),
              steps: (parsed.about?.gemJourney?.steps || defaultSiteContent.about.gemJourney.steps).map((s: any, idx: number) => ({
                ...defaultSiteContent.about.gemJourney.steps[idx],
                ...s,
              }))
            },
            whyRatnapura: { ...defaultSiteContent.about.whyRatnapura, ...(parsed.about?.whyRatnapura || {}) },
            trustStrip: { ...defaultSiteContent.about.trustStrip, ...(parsed.about?.trustStrip || {}) },
            cta: { ...defaultSiteContent.about.cta, ...(parsed.about?.cta || {}) },
          },
          tours: mergeToursContent(parsed.tours),
          proposal: mergeProposalContent(parsed.proposal),
          explore: mergeExploreContent(parsed.explore),
          articles: mergeArticlesContent(parsed.articles),
          contact: mergeContactContent(parsed.contact),
          footer: mergeFooterContent(parsed.footer),
        };
      } catch (e) {
        // ignore parse error
      }
    }
  }





  return defaultSiteContent;
}

export async function saveSiteContent(data: SiteContentData): Promise<{ success: boolean; message: string }> {
  try {
    const formData = new FormData();
    formData.append('content', JSON.stringify(data));

    const response = await authFetch(`${API_BASE_URL}/content/site_data`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || 'Failed to save site content.');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(SITE_CONTENT_STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new Event(SITE_CONTENT_CHANGE_EVENT));
      // Revalidate homepage and primary static pages on-demand
      triggerRevalidation(['/', '/about-us', '/contact']);
    }

    return { success: true, message: 'All website content saved successfully!' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error saving content',
    };
  }
}

/**
 * Universal React Hook for public and admin components to access and react to dynamic site content.
 */
export function useSiteContent() {
  const [content, setContent] = useState<SiteContentData>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(SITE_CONTENT_STORAGE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          return {
            ...defaultSiteContent,
            ...parsed,
            homepage: {
              ...defaultSiteContent.homepage,
              ...(parsed.homepage || {}),
              hero: { ...defaultSiteContent.homepage.hero, ...(parsed.homepage?.hero || {}) },
              stats: parsed.homepage?.stats || defaultSiteContent.homepage.stats,
              journey: { ...defaultSiteContent.homepage.journey, ...(parsed.homepage?.journey || {}) },
              discover: { ...defaultSiteContent.homepage.discover, ...(parsed.homepage?.discover || {}) },
              toursHeader: { ...defaultSiteContent.homepage.toursHeader, ...(parsed.homepage?.toursHeader || {}) },
              reviewsHeader: { ...defaultSiteContent.homepage.reviewsHeader, ...(parsed.homepage?.reviewsHeader || {}) },
              exploreHeader: { ...defaultSiteContent.homepage.exploreHeader, ...(parsed.homepage?.exploreHeader || {}) },
              faqHeader: { ...defaultSiteContent.homepage.faqHeader, ...(parsed.homepage?.faqHeader || {}) },
              articlesHeader: { ...defaultSiteContent.homepage.articlesHeader, ...(parsed.homepage?.articlesHeader || {}) },
              subscription: { ...defaultSiteContent.homepage.subscription, ...(parsed.homepage?.subscription || {}) },
            },
            about: {
              ...defaultSiteContent.about,
              ...(parsed.about || {}),
              hero: { ...defaultSiteContent.about.hero, ...(parsed.about?.hero || {}) },
              metrics: parsed.about?.metrics || defaultSiteContent.about.metrics,
              story: { ...defaultSiteContent.about.story, ...(parsed.about?.story || {}) },
              experience: { 
                ...defaultSiteContent.about.experience, 
                ...(parsed.about?.experience || {}),
                items: parsed.about?.experience?.items || defaultSiteContent.about.experience.items 
              },
              values: { ...defaultSiteContent.about.values, ...(parsed.about?.values || {}) },
              gemJourney: {
                ...defaultSiteContent.about.gemJourney,
                ...(parsed.about?.gemJourney || {}),
                steps: (parsed.about?.gemJourney?.steps || defaultSiteContent.about.gemJourney.steps).map((s: any, idx: number) => ({
                  ...defaultSiteContent.about.gemJourney.steps[idx],
                  ...s,
                }))
              },
              whyRatnapura: { ...defaultSiteContent.about.whyRatnapura, ...(parsed.about?.whyRatnapura || {}) },
              trustStrip: { ...defaultSiteContent.about.trustStrip, ...(parsed.about?.trustStrip || {}) },
              cta: { ...defaultSiteContent.about.cta, ...(parsed.about?.cta || {}) },
            },
            tours: mergeToursContent(parsed.tours),
            proposal: mergeProposalContent(parsed.proposal),
            explore: mergeExploreContent(parsed.explore),
            articles: mergeArticlesContent(parsed.articles),
            contact: mergeContactContent(parsed.contact),
            footer: mergeFooterContent(parsed.footer),
          };





        } catch (e) {
          // ignore
        }
      }
    }
    return defaultSiteContent;
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const latest = await fetchSiteContent();
      if (isMounted) {
        setContent(latest);
        setIsLoaded(true);
      }
    };

    load();

    const handleUpdate = () => {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(SITE_CONTENT_STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setContent({
              ...defaultSiteContent,
              ...parsed,
              homepage: {
                ...defaultSiteContent.homepage,
                ...(parsed.homepage || {}),
                hero: { ...defaultSiteContent.homepage.hero, ...(parsed.homepage?.hero || {}) },
                stats: parsed.homepage?.stats || defaultSiteContent.homepage.stats,
                journey: { ...defaultSiteContent.homepage.journey, ...(parsed.homepage?.journey || {}) },
                discover: { ...defaultSiteContent.homepage.discover, ...(parsed.homepage?.discover || {}) },
                toursHeader: { ...defaultSiteContent.homepage.toursHeader, ...(parsed.homepage?.toursHeader || {}) },
                reviewsHeader: { ...defaultSiteContent.homepage.reviewsHeader, ...(parsed.homepage?.reviewsHeader || {}) },
                exploreHeader: { ...defaultSiteContent.homepage.exploreHeader, ...(parsed.homepage?.exploreHeader || {}) },
                faqHeader: { ...defaultSiteContent.homepage.faqHeader, ...(parsed.homepage?.faqHeader || {}) },
                articlesHeader: { ...defaultSiteContent.homepage.articlesHeader, ...(parsed.homepage?.articlesHeader || {}) },
                subscription: { ...defaultSiteContent.homepage.subscription, ...(parsed.homepage?.subscription || {}) },
              },
              about: {
                ...defaultSiteContent.about,
                ...(parsed.about || {}),
                hero: { ...defaultSiteContent.about.hero, ...(parsed.about?.hero || {}) },
                metrics: parsed.about?.metrics || defaultSiteContent.about.metrics,
                story: { ...defaultSiteContent.about.story, ...(parsed.about?.story || {}) },
                experience: { 
                  ...defaultSiteContent.about.experience, 
                  ...(parsed.about?.experience || {}),
                  items: parsed.about?.experience?.items || defaultSiteContent.about.experience.items 
                },
                values: { ...defaultSiteContent.about.values, ...(parsed.about?.values || {}) },
                gemJourney: {
                  ...defaultSiteContent.about.gemJourney,
                  ...(parsed.about?.gemJourney || {}),
                  steps: (parsed.about?.gemJourney?.steps || defaultSiteContent.about.gemJourney.steps).map((s: any, idx: number) => ({
                    ...defaultSiteContent.about.gemJourney.steps[idx],
                    ...s,
                  }))
                },
                whyRatnapura: { ...defaultSiteContent.about.whyRatnapura, ...(parsed.about?.whyRatnapura || {}) },
                trustStrip: { ...defaultSiteContent.about.trustStrip, ...(parsed.about?.trustStrip || {}) },
                cta: { ...defaultSiteContent.about.cta, ...(parsed.about?.cta || {}) },
              },
              tours: mergeToursContent(parsed.tours),
              proposal: mergeProposalContent(parsed.proposal),
              explore: mergeExploreContent(parsed.explore),
              articles: mergeArticlesContent(parsed.articles),
              contact: mergeContactContent(parsed.contact),
              footer: mergeFooterContent(parsed.footer),
            });





          } catch (e) {
            // ignore
          }
        }
      }
    };

    window.addEventListener(SITE_CONTENT_CHANGE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener(SITE_CONTENT_CHANGE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return { content, isLoaded };
}

/**
 * Uploads an image file directly to the Payshia FTP server in a specific subdirectory
 * and returns the permanent CDN URL (e.g. https://content-provider.payshia.com/sapphire-trail/cms/proposal/...)
 */
export async function uploadCmsImage(file: File, folder: string = 'cms'): Promise<{ success: boolean; url: string; filename?: string }> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  const response = await authFetch(`${API_BASE_URL}/content/upload-image/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || 'Failed to upload image to FTP server.');
  }

  const data = await response.json();
  return {
    success: true,
    url: data.url,
    filename: data.filename
  };
}

