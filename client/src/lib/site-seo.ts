import { API_BASE_URL } from '@/lib/utils';

export interface SeoFaqItem {
  question: string;
  answer: string;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage: string;
  ratingValue: string;
  reviewCount: string;
  faqs: SeoFaqItem[];
}

export const defaultSeoFaqs: SeoFaqItem[] = [
  {
    question: "Can tourists visit gem mines in Ratnapura, Sri Lanka?",
    answer: "Yes. Many guesthouses, licensed local operators, and gem shops in Ratnapura arrange visits to working mines, and some include it in the stay. With Sapphire Trails, visitors descend safely into authentic timber-reinforced pits with certified safety harnesses, observe illam extraction, and participate in traditional river gravel washing."
  },
  {
    question: "How do I book an authentic Gem Mining Tour in Ratnapura (Rathnapura), Sri Lanka?",
    answer: "You can easily reserve your private Sri Lankan gem mine tour online through our booking portal on sapphiretrails.lk, via WhatsApp at +94 76 375 6688, or by consulting our concierge. We offer all-inclusive day expeditions and multi-day gemological journeys starting from Colombo, Kandy, Galle, or directly in Ratnapura."
  },
  {
    question: "What makes a Sri Lankan gem mine tour unique compared to other world destinations?",
    answer: "Unlike hard-rock diamond or emerald extraction elsewhere, Sri Lanka features ancient alluvial gravel layers ('Illam') located in Ratnapura. Visitors can experience authentic hand-dug shafts, traditional wicker basket river washing ('Garilla'), open-air street trading markets, and Ceylon sapphire lapidaries—all in one immersive gem mining tour."
  },
  {
    question: "Is it safe to descend into the active gem mines?",
    answer: "Yes, 100%. We operate strictly with government-licensed, timber-reinforced traditional mines inspected for structural integrity. Every guest is outfitted with safety harnesses, hard hats, and LED headlamps. You are guided one-on-one by our veteran mining team and licensed guide throughout the descent."
  },
  {
    question: "Can I keep the gemstones I find while washing the gravel?",
    answer: "Absolutely! Any semi-precious gemstones (such as tourmalines, garnets, zircons, and quartz) and raw minerals you discover during your hands-on traditional gravel washing experience are yours to keep as authentic Sri Lankan souvenirs. If you uncover a high-value precious sapphire, our gemologist will assist with valuation and export certification."
  },
  {
    question: "Do you offer private hotel pickup from Colombo, Kandy, or Galle?",
    answer: "Yes. All our signature and custom tour packages include private round-trip transfers in air-conditioned vehicles directly from your hotel or resort in Colombo, Kandy, Galle, Bentota, or Bandaranaike International Airport (CMB)."
  },
  {
    question: "What is the recommended dress code for the gem mine tour?",
    answer: "We recommend comfortable, lightweight cotton clothing that you don't mind getting slightly dusty or splashed with river water. Closed-toe walking shoes or sneakers are mandatory for pit descents. We provide specialized safety boots and rain boots for the riverbed gravel washing experience."
  },
  {
    question: "Can I buy certified Ceylon Sapphires or custom jewellery during the tour?",
    answer: "Yes. At the conclusion of your tour at Grand Silver Ray, you can visit our certified gemological laboratory. You can select unheated or heated natural Ceylon Blue, Padparadscha, Pink, and Yellow sapphires accompanied by recognized international laboratory certificates (GIA, GIC, Lotus)."
  },
  {
    question: "What is your booking flexibility and cancellation policy?",
    answer: "We offer flexible rescheduling. If your travel plans change due to weather or flight adjustments, you can reschedule your expedition free of charge with 24 hours notice. Advance deposit refunds are processed according to our transparent concierge terms."
  }
];

export const defaultSeoSettings: SeoSettings = {
  metaTitle: 'Authentic Gem Mine Tours Sri Lanka | Sapphire Trails Ratnapura',
  metaDescription: 'Experience authentic, traditional gem mining in Ratnapura, Sri Lanka. Descend into active timber pits, try riverbed gem washing, and tour with certified local gemologists.',
  keywords: [
    'authentic gem mining tour sri lanka',
    'ratnapura gem mine tour',
    'traditional gem washing experience',
    'ethical gem tour sri lanka',
    'gem pit visit ratnapura',
    'sri lanka gem tour packages',
    'ratnapura gem city tour',
    'ceylon sapphire tours',
    'can tourists visit gem mines in ratnapura',
    'ratnapura gem market',
    'mine to market gemstone tour'
  ],
  ogImage: 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
  ratingValue: '4.9',
  reviewCount: '124',
  faqs: defaultSeoFaqs,
};

export interface ServerSiteData {
  settings?: {
    seo?: SeoSettings;
    [key: string]: any;
  };
  contact?: {
    primaryPhone?: string;
    physicalAddress?: string;
    [key: string]: any;
  };
  footer?: {
    facebookUrl?: string;
    instagramUrl?: string;
    tripadvisorUrl?: string;
    youtubeUrl?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export async function fetchSiteContentServer(): Promise<ServerSiteData> {
  try {
    const response = await fetch(`${API_BASE_URL}/content/site_data`, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });
    if (response.ok) {
      const data = await response.json();
      if (data && typeof data === 'object') {
        const rawFaqs = data.settings?.seo?.faqs;
        const faqs = (Array.isArray(rawFaqs) && rawFaqs.length > 0)
          ? rawFaqs
          : defaultSeoFaqs;

        const rawKeywords = data.settings?.seo?.keywords;
        const keywords = (Array.isArray(rawKeywords) && rawKeywords.length > 0)
          ? rawKeywords
          : defaultSeoSettings.keywords;

        return {
          ...data,
          settings: {
            ...(data.settings || {}),
            seo: {
              ...defaultSeoSettings,
              ...(data.settings?.seo || {}),
              keywords,
              faqs,
            },
          },
        };
      }
    }
  } catch (err) {
    console.warn('[fetchSiteContentServer] Failed to fetch remote site data, using defaults:', err);
  }

  return {
    settings: {
      seo: defaultSeoSettings,
    },
  };
}
