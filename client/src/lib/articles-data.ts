export interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  category: string;
  readTime: string;
  publishedDate: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  keyTakeaways: string[];
  contentHtml: string;
  status: 'published' | 'draft';
}

export const initialArticles: ArticleItem[] = [
  {
    id: '1',
    slug: 'guide-to-ratnapura-gems',
    title: 'The Definitive Guide to Ratnapura Gems: Ceylon Sapphires, Padparadscha & Ancient Gravels',
    subtitle: 'An insider look into the geological treasures of Sri Lanka’s City of Gems, from raw illam extraction to international lab grading standards.',
    description: 'Discover the world-famous gemstones of Ratnapura. Learn about natural Ceylon Blue Sapphires, Padparadscha, Star Stones, heat treatments, market valuation, and how to safely navigate the gem capital.',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img37.webp',
    imageHint: 'colorful gemstones collection Ceylon',
    category: 'Gemology & Valuation',
    readTime: '6 min read',
    publishedDate: 'February 2026',
    status: 'published',
    author: {
      name: 'Dr. Rohan Samarasinghe, FGA',
      role: 'Chief Gemological Consultant',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    },
    keyTakeaways: [
      'Ratnapura produces over 75 distinct gemstone varieties from an ancient alluvial gravel layer called "Illam".',
      'Sri Lankan Royal Blue and Cornflower Blue Sapphires are celebrated globally for exceptional brilliance and light dispersion.',
      'The legendary Padparadscha ("lotus blossom") sapphire is native to Sri Lanka and commands the highest per-carat prices.',
      'Always insist on recognized international laboratory certificates (GIA, GIC, Lotus, SSEF) when acquiring unheated stones.'
    ],
    contentHtml: `
      <p class="lead text-lg md:text-xl font-normal text-foreground/90 leading-relaxed">
        Nestled in the mist-shrouded foothills of the Adam’s Peak mountain range lies <strong>Ratnapura</strong>—a city whose very name translates to <em>"The City of Gems"</em> in Sanskrit. For over two millennia, this legendary valley has supplied monarchies, royal jewelers, and auction houses with the world’s most mesmerizing corundum treasures.
      </p>

      <h2>The Geological Miracle of "Illam" Gravels</h2>
      <p>
        Unlike diamond mines in Africa or emerald deposits in Colombia which are frequently extracted from hard rock kimberlite pipes, Ratnapura’s gemstones are predominantly <strong>alluvial deposits</strong>. Hundreds of millions of years of monsoonal weathering eroded ancient pegmatite veins high in the central highlands, washing heavy gemstone crystals down into ancient riverbeds.
      </p>
      <p>
        Today, these precious crystals sit compressed within a subterranean, clay-rich gravel stratum known locally as <strong>"Illam"</strong> (ඉල්ලම), buried anywhere from 15 to 80 feet beneath lush paddy fields and river floodplains.
      </p>

      <h2>Signature Gemstones Uncovered in Ratnapura</h2>
      <p>
        While sapphires reign supreme, the diversity of mineral species extracted across Ratnapura is unrivaled anywhere on Earth. Here are the crown jewels of the region:
      </p>

      <h3>1. Ceylon Blue Sapphire (Royal Blue & Cornflower Blue)</h3>
      <p>
        Celebrated for its distinct velvety luminosity, Ceylon blue sapphire tends to have a lighter, more vibrant primary hue than dark Australian stones or inky Thai corundum. The two most sought-after color grades are <em>"Cornflower Blue"</em> (a luminous pastel blue with soft violet undertones) and <em>"Royal Blue"</em> (a rich, vivid deep cobalt blue).
      </p>

      <h3>2. Padparadscha Sapphire (The Lotus Blossom)</h3>
      <p>
        Derived from the Sinhalese word <em>"Padmaraga"</em> (the color of a tropical lotus flower at sunset), this is the rarest and most valuable sapphire variety on Earth. A true Padparadscha must showcase a delicate, unseparated blend of pink and orange simultaneously.
      </p>

      <h3>3. Star Sapphires & Star Rubies (Asterism)</h3>
      <p>
        When microscopic rutile silk needles align along the hexagonal crystal axes of corundum, cutting the stone into a smooth cabochon reveals a sharp, dancing 6-ray star when illuminated by direct light. Sri Lanka holds the world record for the largest star sapphires ever unearthed.
      </p>

      <h3>4. Chrysoberyl Cat’s Eye & Alexandrite</h3>
      <p>
        Ratnapura produces world-class Chrysoberyl with phenomenal razor-sharp <em>"milk and honey"</em> chatoyancy (Cat’s Eye), as well as color-changing <strong>Alexandrite</strong>—which shifts from emerald green in daylight to ruby red under incandescent light.
      </p>

      <h2>Unheated vs. Heat-Treated Sapphires: The Valuation Factor</h2>
      <p>
        Understanding thermal enhancement is crucial for any collector or traveler. Traditional thermal treatment dissolves rutile silk to improve clarity and enrich color tone.
      </p>
      <ul>
        <li><strong>Unheated (Natural):</strong> Completely untreated straight from the earth. Represents less than 1% of top-grade market output and commands a 50% to 200%+ premium.</li>
        <li><strong>Standard Heat-Treated:</strong> A universally accepted, permanent, and stable industry practice that optimizes natural beauty.</li>
      </ul>
    `
  },
  {
    id: '2',
    slug: 'complete-guide-to-gem-tour-experience',
    title: 'The Complete Guide to Your Next Gem Tour Experience in Sri Lanka',
    subtitle: 'From timbered underground shafts to traditional wicker basket river washing—everything to expect on an authentic expedition.',
    description: 'An exhaustive walkthrough of what happens on a luxury gem mining tour in Ratnapura, Sri Lanka. Dress codes, safety gear, pit descent, and street trading protocols.',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img2.webp',
    imageHint: 'active gem mining pit experience',
    category: 'Expedition Guide',
    readTime: '5 min read',
    publishedDate: 'February 2026',
    status: 'published',
    author: {
      name: 'Chaminda Wijesinghe',
      role: 'Lead Expedition Guide & Naturalist',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    },
    keyTakeaways: [
      'Safety harnesses and boots are provided for all guests descending active shafts.',
      'Experience traditional stream washing to separate heavy gemstone gravel.',
      'Visit local lapidary masters who precision-cut rough stones using traditional wooden gem wheels.',
      'Pickups are available directly from Colombo, Galle, Bentota, and Kandy in luxury AC vehicles.'
    ],
    contentHtml: `
      <p class="lead text-lg md:text-xl font-normal text-foreground/90 leading-relaxed">
        Visiting an active Ceylon gem mine is unlike any standard tourist excursion. It is a sensory immersion into a living craft that has remained virtually unchanged for centuries.
      </p>

      <h2>Morning Preparation & Luxury Private Transfer</h2>
      <p>
        Your expedition begins with an early morning pickup from your hotel or villa in a private luxury air-conditioned vehicle with scenic views of rubber plantations and emerald tea terraces.
      </p>

      <h2>Safety Briefing & Shaft Descent</h2>
      <p>
        At our government-licensed partner mine, you are outfitted with sanitized safety helmets, headlamps, and harnesses. Accompanied by our licensed gemologist, you will inspect timbered shafts and witness active mining firsthand.
      </p>

      <h2>The Art of Traditional River Washing (Garilla)</h2>
      <p>
        You will step into the shallow waters and learn the rhythmic circular swirling motion using traditional conical bamboo baskets (<em>Wattiya</em>) to separate heavy gemstone gravel from silt.
      </p>
    `
  },
  {
    id: '3',
    slug: 'visiting-ratnapura-gem-market',
    title: 'A Pro’s Guide to the Ratnapura Gem Market: Street Trading Secrets & Protocols',
    subtitle: 'How rough and cut sapphires change hands in the world’s most dynamic open-air gem bazaar.',
    description: 'Learn the unwritten etiquette of the Ratnapura gem street market. Optical torch testing, bargaining signals, and tips for collectors.',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp',
    imageHint: 'gemstones collection street market',
    category: 'Market Insights',
    readTime: '4 min read',
    publishedDate: 'January 2026',
    status: 'published',
    author: {
      name: 'Dr. Rohan Samarasinghe, FGA',
      role: 'Chief Gemological Consultant',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    },
    keyTakeaways: [
      'The morning street market operates between 8:00 AM and 12:00 PM along Main Street.',
      'Traders use specialized LED optical torches and immersion liquids to inspect crystal inclusions.',
      'Never touch a stone being inspected by another dealer until they hand it back.',
      'Our guests are accompanied by a licensed gemologist to explain every transaction.'
    ],
    contentHtml: `
      <p class="lead text-lg md:text-xl font-normal text-foreground/90 leading-relaxed">
        Every morning between 8:00 AM and midday, the narrow streets of Ratnapura transform into the beating heart of the global sapphire trade.
      </p>

      <h2>The Rhythm of the Morning Bazaar</h2>
      <p>
        Deals are conducted informally, with stones wrapped in neat triangular paper packets (<em>Patthu</em>) and inspected under morning sunlight.
      </p>
    `
  },
  {
    id: '4',
    slug: 'history-of-sri-lankan-gem-mining',
    title: 'The 2,500-Year Chronicle of Sri Lankan Gem Mining: From King Solomon to Modern Times',
    subtitle: 'How an island known to ancient Greeks as Taprobane and Arabs as Serendib became the cradle of global gemology.',
    description: 'Explore the 25-century history of Ceylon gem mining. Ancient royal chronicles, Marco Polo’s travel diaries, and sustainable hand-dug traditions.',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
    imageHint: 'historic gem mine cave',
    category: 'Heritage & History',
    readTime: '5 min read',
    publishedDate: 'January 2026',
    status: 'published',
    author: {
      name: 'Chaminda Wijesinghe',
      role: 'Lead Expedition Guide & Naturalist',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    },
    keyTakeaways: [
      'Sri Lanka is one of the oldest recorded continuous sources of precious gemstones in human history.',
      'Sinbad the Sailor’s mythical "Valley of Gems" was inspired by Ratnapura.',
      'Traditional mining remains environmentally sustainable with manual excavation.',
      'All mining pits are legally refilled and replanted after extraction.'
    ],
    contentHtml: `
      <p class="lead text-lg md:text-xl font-normal text-foreground/90 leading-relaxed">
        When Marco Polo visited Ceylon in the 13th century, he recorded that the island produced more precious stones than any other spot on Earth.
      </p>

      <h2>Ancient Chronicles & The Silk Road</h2>
      <p>
        The Mahavamsa chronicle notes that gems from Ratnapura were sent as diplomatic gifts by King Devanampiya Tissa to Emperor Ashoka of India in 250 BCE.
      </p>
    `
  }
];

export const ARTICLES_STORAGE_KEY = 'sapphire_articles_data';

export function getStoredArticles(): ArticleItem[] {
  if (typeof window === 'undefined') return initialArticles;
  try {
    const raw = localStorage.getItem(ARTICLES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to load stored articles", e);
  }
  return initialArticles;
}

export function saveStoredArticles(articles: ArticleItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));
  } catch (e) {
    console.error("Failed to save articles", e);
  }
}

import { API_BASE_URL } from './utils';
import { authFetch } from './api';

export function normalizeArticle(raw: any): ArticleItem {
  return {
    id: String(raw.id || ''),
    slug: raw.slug || '',
    title: raw.title || '',
    subtitle: raw.subtitle || '',
    description: raw.description || '',
    imageUrl: raw.imageUrl || raw.image_url || 'https://content-provider.payshia.com/sapphire-trail/images/img37.webp',
    imageHint: raw.imageHint || raw.image_hint || '',
    category: raw.category || 'General',
    readTime: raw.readTime || raw.read_time || '5 min read',
    publishedDate: raw.publishedDate || raw.published_date || 'February 2026',
    status: raw.status || 'published',
    author: {
      name: raw.author?.name || raw.author_name || 'Editorial Team',
      role: raw.author?.role || raw.author_role || 'Contributor',
      avatar: raw.author?.avatar || raw.author_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    },
    keyTakeaways: Array.isArray(raw.keyTakeaways) 
      ? raw.keyTakeaways 
      : (Array.isArray(raw.key_takeaways) ? raw.key_takeaways : []),
    contentHtml: raw.contentHtml || raw.content_html || ''
  };
}

/**
 * Fetch all articles from live API with ISR support and robust fallback
 */
export async function fetchArticles(revalidateSeconds = 3600): Promise<ArticleItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/articles`, {
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) {
      console.warn(`[Articles] Live API fetch failed with status ${res.status}. Falling back to default list.`);
      return initialArticles;
    }
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map(normalizeArticle);
    }
  } catch (err) {
    console.error('[Articles] Live API connection error:', err);
  }
  return initialArticles;
}

/**
 * Fetch a single article by slug with ISR support and fallback
 */
export async function fetchArticleBySlug(slug: string, revalidateSeconds = 3600): Promise<ArticleItem | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${slug}`, {
      next: { revalidate: revalidateSeconds },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.slug) {
        return normalizeArticle(data);
      }
    }
  } catch (err) {
    console.error(`[Articles] Live API error fetching slug '${slug}':`, err);
  }

  // Fallback to initial articles
  const localMatch = initialArticles.find((a) => a.slug === slug);
  return localMatch || null;
}

import { triggerRevalidation } from './revalidate';

/**
 * Admin API: Create article
 */
export async function createArticleApi(article: Partial<ArticleItem>): Promise<ArticleItem> {
  const res = await authFetch('/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create article');
  }

  const created = normalizeArticle(data.article || data);

  // Trigger On-Demand ISR revalidation so live pages update immediately
  triggerRevalidation(['/articles', `/articles/${created.slug}`, '/']);

  return created;
}

/**
 * Admin API: Update article
 */
export async function updateArticleApi(identifier: string, article: Partial<ArticleItem>): Promise<ArticleItem> {
  const res = await authFetch(`/articles/${identifier}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update article');
  }

  const updated = normalizeArticle(data.article || data);

  // Trigger On-Demand ISR revalidation so live pages update immediately
  triggerRevalidation(['/articles', `/articles/${updated.slug}`, '/']);

  return updated;
}

/**
 * Admin API: Delete article
 */
export async function deleteArticleApi(identifier: string): Promise<boolean> {
  const res = await authFetch(`/articles/${identifier}`, {
    method: 'DELETE',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete article');
  }

  // Trigger On-Demand ISR revalidation
  triggerRevalidation(['/articles', '/']);

  return true;
}

