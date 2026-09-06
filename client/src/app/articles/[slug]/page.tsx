import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata, ResolvingMetadata } from 'next';
import { mapServerPackageToClient, type TourPackage } from '@/lib/packages-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  CalendarCheck, 
  ArrowRight, 
  Clock, 
  Calendar, 
  User, 
  BookOpen, 
  Sparkles, 
  Share2, 
  CheckCircle2, 
  MessageCircle, 
  Gem,
  ChevronRight,
  Award
} from 'lucide-react';
import { TrustSection } from '@/components/sections/TrustSection';
import { API_BASE_URL } from '@/lib/utils';
import { fetchArticles, fetchArticleBySlug } from '@/lib/articles-data';

export const revalidate = 3600;
export const dynamicParams = true;

// Comprehensive, authoritative gemology & expedition articles
const articlesDatabase: Record<string, {
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
}> = {
  'guide-to-ratnapura-gems': {
    slug: 'guide-to-ratnapura-gems',
    title: 'The Definitive Guide to Ratnapura Gems: Ceylon Sapphires, Padparadscha & Ancient Gravels',
    subtitle: 'An insider look into the geological treasures of Sri Lanka’s City of Gems, from raw illam extraction to international lab grading standards.',
    description: 'Discover the world-famous gemstones of Ratnapura. Learn about natural Ceylon Blue Sapphires, Padparadscha, Star Stones, heat treatments, market valuation, and how to safely navigate the gem capital.',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img37.webp',
    imageHint: 'colorful gemstones collection Ceylon',
    category: 'Gemology & Valuation',
    readTime: '6 min read',
    publishedDate: 'February 2026',
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

      <div class="my-8 p-6 rounded-2xl bg-primary/[0.06] border border-primary/30 not-prose">
        <div class="flex items-start gap-3.5">
          <div class="p-2.5 rounded-xl bg-primary text-primary-foreground">
            <Gem class="h-5 w-5" />
          </div>
          <div>
            <h4 class="font-headline font-bold text-foreground text-base">The Royal Heritage of Ceylon Sapphires</h4>
            <p class="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
              Ceylon Sapphires have adorned the British Imperial State Crown, King Solomon’s courtship gifts to the Queen of Sheba, and famously, the 12-carat oval Ceylon Blue Sapphire engagement ring worn by Princess Diana and Catherine, Princess of Wales.
            </p>
          </div>
        </div>
      </div>

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
        When microscopic rutile silk needles align along the hexagonal crystal axes of corundum, cutting the stone into a smooth cabochon reveals a sharp, dancing 6-ray star when illuminated by direct light. Sri Lanka holds the world record for the largest star sapphires ever unearthed (including the 1404-carat Star of Adam).
      </p>

      <h3>4. Chrysoberyl Cat’s Eye & Alexandrite</h3>
      <p>
        Ratnapura produces world-class Chrysoberyl with phenomenal razor-sharp <em>"milk and honey"</em> chatoyancy (Cat’s Eye), as well as color-changing <strong>Alexandrite</strong>—which shifts from emerald green in daylight to ruby red under incandescent light.
      </p>

      <h2>Unheated vs. Heat-Treated Sapphires: The Valuation Factor</h2>
      <p>
        Understanding thermal enhancement is crucial for any collector or traveler. Traditional thermal treatment (often conducted with high-temperature blowpipes or electrical furnaces) dissolves rutile silk to improve clarity and enrich color tone.
      </p>
      <ul>
        <li><strong>Unheated (Natural):</strong> Completely untreated straight from the earth. Represents less than 1% of top-grade market output and commands a 50% to 200%+ premium among collectors.</li>
        <li><strong>Standard Heat-Treated:</strong> A universally accepted, permanent, and stable industry practice that optimizes natural beauty without synthetic glass fillers.</li>
      </ul>

      <h2>How to Safely Experience the Mines and Acquire Gems</h2>
      <p>
        Navigating the gem trade requires specialized insider access. On a <strong>Sapphire Trails VIP Expedition</strong>, travelers receive:
      </p>
      <ol>
        <li>Direct descent into licensed, timbered mining shafts with full safety harnesses and helmets.</li>
        <li>Hands-on gravel washing (Garilla) alongside local miners using ancient conical cane baskets.</li>
        <li>Guided walkthroughs of the morning street trading bazaar with optical torch inspection demonstrations.</li>
        <li>Access to private lapidary workshops and certified gemological testing laboratories (with GIA, GIC, or Lotus certification).</li>
      </ol>

      <div class="mt-8 p-6 rounded-2xl bg-card border border-border not-prose flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 class="font-headline font-bold text-foreground text-base">Plan Your Private Ratnapura Expedition</h4>
          <p class="text-xs text-muted-foreground mt-0.5">Explore active pits, historic riverbeds, and gem laboratories in total luxury.</p>
        </div>
        <a href="/tours/exclusive-gem-mining-tour/book" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-transform hover:scale-105 shadow-md">
          Book Mining Expedition
        </a>
      </div>
    `
  },
  'complete-guide-to-gem-tour-experience': {
    slug: 'complete-guide-to-gem-tour-experience',
    title: 'The Complete Guide to Your Next Gem Tour Experience in Sri Lanka',
    subtitle: 'From timbered underground shafts to traditional wicker basket river washing—everything to expect on an authentic expedition.',
    description: 'An exhaustive walkthrough of what happens on a luxury gem mining tour in Ratnapura, Sri Lanka. Dress codes, safety gear, pit descent, and street trading protocols.',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img2.webp',
    imageHint: 'active gem mining pit experience',
    category: 'Expedition Guide',
    readTime: '5 min read',
    publishedDate: 'February 2026',
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
        Visiting an active Ceylon gem mine is unlike any standard tourist excursion. It is a sensory immersion into a living craft that has remained virtually unchanged since the days of Sinbad the Sailor and Marco Polo.
      </p>

      <h2>Morning Preparation & Luxury Private Transfer</h2>
      <p>
        Your expedition begins with an early morning pickup from your hotel or villa in a private luxury air-conditioned vehicle. As you leave the coastal lowlands, the scenery ascends into lush rubber plantations, cascading streams, and emerald tea terraces before descending into the fertile Ratnapura river basin.
      </p>

      <h2>Safety Briefing & Shaft Descent</h2>
      <p>
        At our government-licensed partner mine, you are outfitted with sanitized safety helmets, headlamps, and harnesses. Accompanied by our licensed gemologist and veteran pit masters, you will:
      </p>
      <ul>
        <li>Inspect the traditional timbered framework constructed with rubberwood and fern leaves to prevent cave-ins.</li>
        <li>Observe the ancient manual bucket winch system used to hoist mud and Illam gravel to the surface.</li>
        <li>Descend into active tunnels to witness how miners locate the gravel vein using hand picks and chisel rods.</li>
      </ul>

      <h2>The Art of Traditional River Washing (Garilla)</h2>
      <p>
        Once the Illam gravel is brought to the surface, it is transported to a nearby mountain stream or washing pool. You will step into the shallow waters and learn the rhythmic circular swirling motion using traditional conical bamboo baskets (<em>Wattiya</em>). The swirling action causes lighter sand and mud to wash over the rim, leaving dense garnet, tourmaline, zircon, and sapphire crystals settled at the apex.
      </p>

      <h2>The Morning Street Gem Bazaar</h2>
      <p>
        Next, we visit the historic Ratnapura open-air gem street market. Here, hundreds of independent miners and gem merchants gather each morning. You will observe the secretive hand-signal bargaining rituals concealed under handkerchiefs and watch master traders inspect stones against the morning sunlight with 10x achromatic loupes.
      </p>
    `
  },
  'visiting-ratnapura-gem-market': {
    slug: 'visiting-ratnapura-gem-market',
    title: 'A Pro’s Guide to the Ratnapura Gem Market: Street Trading Secrets & Protocols',
    subtitle: 'How rough and cut sapphires change hands in the world’s most dynamic open-air gem bazaar.',
    description: 'Learn the unwritten etiquette of the Ratnapura gem street market. Optical torch testing, bargaining signals, and tips for collectors.',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp',
    imageHint: 'gemstones collection street market',
    category: 'Market Insights',
    readTime: '4 min read',
    publishedDate: 'January 2026',
    author: {
      name: 'Dr. Rohan Samarasinghe, FGA',
      role: 'Chief Gemological Consultant',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    },
    keyTakeaways: [
      'The morning street market operates between 8:00 AM and 12:00 PM along Main Street.',
      'Traders use small specialized LED optical torches and immersion liquids to inspect internal crystal inclusions.',
      'Never touch a stone that is currently being inspected by another dealer until they have handed it back.',
      'Our guests are accompanied by a licensed gemologist to translate and explain every transaction in real-time.'
    ],
    contentHtml: `
      <p class="lead text-lg md:text-xl font-normal text-foreground/90 leading-relaxed">
        Every morning between 8:00 AM and midday, the narrow streets of Ratnapura transform into the beating heart of the global sapphire trade. Merchants from Japan, Europe, Dubai, and Hong Kong mingle with local miners who have just emerged from the pits.
      </p>

      <h2>The Rhythm of the Morning Bazaar</h2>
      <p>
        Unlike retail boutiques with velvet trays and display cases, the Ratnapura street market takes place directly on the sidewalks. Deals are conducted informally, with stones wrapped in neat triangular paper packets (<em>Patthu</em>).
      </p>

      <h2>Optical Inspection Techniques</h2>
      <p>
        Experienced buyers rely on portable 10x triplets and daylight-balanced optical torches. By placing the gemstone over a focused beam of light in a dark viewing corner or beneath a folded paper cone, experts can assess:
      </p>
      <ul>
        <li><strong>Color Zoning:</strong> How color is distributed throughout the crystal lattice.</li>
        <li><strong>Silk & Inclusions:</strong> The presence of microscopic rutile needles that confirm unheated origin.</li>
        <li><strong>Fractures & Cleavage:</strong> Internal fissures that determine how the rough stone will be oriented on the cutting wheel.</li>
      </ul>
    `
  },
  'history-of-sri-lankan-gem-mining': {
    slug: 'history-of-sri-lankan-gem-mining',
    title: 'The 2,500-Year Chronicle of Sri Lankan Gem Mining: From King Solomon to Modern Times',
    subtitle: 'How an island known to ancient Greeks as Taprobane and Arabs as Serendib became the cradle of global gemology.',
    description: 'Explore the 25-century history of Ceylon gem mining. Ancient royal chronicles, Marco Polo’s travel diaries, and sustainable hand-dug traditions.',
    imageUrl: 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
    imageHint: 'historic gem mine cave',
    category: 'Heritage & History',
    readTime: '5 min read',
    publishedDate: 'January 2026',
    author: {
      name: 'Chaminda Wijesinghe',
      role: 'Lead Expedition Guide & Naturalist',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    },
    keyTakeaways: [
      'Sri Lanka is one of the oldest recorded continuous sources of precious gemstones in human history.',
      'Sinbad the Sailor’s mythical "Valley of Gems" in One Thousand and One Nights was inspired by Ratnapura.',
      'Traditional mining in Sri Lanka remains environmentally sustainable, relying on manual excavation rather than destructive open-pit machinery.',
      'All mining pits are legally required to be refilled and replanted after extraction to preserve the ecosystem.'
    ],
    contentHtml: `
      <p class="lead text-lg md:text-xl font-normal text-foreground/90 leading-relaxed">
        When Marco Polo visited Ceylon in the 13th century, he wrote: <em>"The island produces more precious stones than any other spot on Earth—sapphires, topazes, amethysts, and rubies beyond measure."</em>
      </p>

      <h2>Ancient Chronicles & The Silk Road</h2>
      <p>
        Sri Lanka’s gem heritage predates the Common Era. The Mahavamsa chronicle notes that gems from Ratnapura were sent as diplomatic gifts by King Devanampiya Tissa to Emperor Ashoka of India in 250 BCE. Roman historian Pliny the Elder recorded that gemstones from Taprobane were prized above all others by Roman patricians.
      </p>

      <h2>Preserving Sustainable Hand-Mining Traditions</h2>
      <p>
        Unlike industrial open-cast diamond and gold mining in other regions which leave massive scars on the earth, Sri Lanka’s gem mining laws strictly mandate artisanal, hand-dug methods. This ensures that:
      </p>
      <ul>
        <li>Water tables are protected from toxic industrial runoffs.</li>
        <li>Local mining communities retain ownership and share direct profits from every strike.</li>
        <li>Land is restored, refilled, and re-cultivated with paddy or cinnamon crops once the vein is depleted.</li>
      </ul>
    `
  }
};

export async function generateStaticParams() {
  try {
    const articles = await fetchArticles(3600);
    if (articles && articles.length > 0) {
      return articles.map((article) => ({
        slug: article.slug,
      }));
    }
  } catch (e) {
    console.error('Error generating static params for articles:', e);
  }
  return Object.keys(articlesDatabase).map((slug) => ({ slug }));
}

async function getArticle(slug: string) {
  try {
    const remote = await fetchArticleBySlug(slug, 3600);
    if (remote) return remote;
  } catch (e) {
    console.error(`Error fetching article by slug '${slug}':`, e);
  }
  return articlesDatabase[slug] || null;
}

async function getTours(): Promise<TourPackage[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/tours`, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    const data = await response.json();
    if (Array.isArray(data)) return data.map(mapServerPackageToClient);
    return [];
  } catch (e) {
    console.error("Failed to fetch packages.", e);
    return [];
  }
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: 'Article Not Found | Sapphire Trails' };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${article.title} | Sapphire Trails`,
    description: article.description,
    alternates: {
      canonical: `/articles/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      images: [
        {
          url: article.imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
        ...previousImages,
      ],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  const tours = await getTours();

  if (!article) {
    notFound();
  }

  let allArticles = await fetchArticles(3600);
  if (!allArticles || allArticles.length === 0) {
    allArticles = Object.values(articlesDatabase) as any;
  }

  const otherArticles = allArticles
    .filter(item => item.slug !== slug)
    .slice(0, 3);

  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": article.imageUrl,
    "datePublished": "2026-02-01T08:00:00+05:30",
    "dateModified": "2026-02-28T12:00:00+05:30",
    "author": {
      "@type": "Person",
      "name": article.author.name,
      "jobTitle": article.author.role
    },
    "publisher": {
      "@type": "Organization",
      "name": "Sapphire Trails",
      "logo": {
        "@type": "ImageObject",
        "url": "https://sapphiretrails.lk/img/logo4.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://sapphiretrails.lk/articles/${article.slug}`
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <Header />

      <main className="flex-1">
        
        {/* Article Editorial Header */}
        <section className="w-full bg-background-alt border-b border-border/80 py-12 md:py-16">
          <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-5">
              
              {/* Breadcrumb Navigation */}
              <nav className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <ChevronRight className="h-3 w-3" />
                <Link href="/articles" className="hover:text-primary transition-colors">Articles</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-primary font-medium truncate max-w-xs">{article.title}</span>

              </nav>

              {/* Category Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/40 text-xs font-semibold uppercase tracking-wider text-primary">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{article.category}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight leading-tight">
                {article.title}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {article.subtitle}
              </p>

              {/* Meta details bar */}
              <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-primary/40">
                    <Image
                      src={article.author.avatar}
                      alt={article.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{article.author.name}</p>
                    <p className="text-[11px] text-muted-foreground">{article.author.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {article.publishedDate}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    {article.readTime}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Main Article Content & Sidebar */}
        <section className="w-full py-12 md:py-20 bg-background">
          <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              
              {/* Left Main Article Column */}
              <article className="lg:col-span-8 space-y-10">
                
                {/* Featured Hero Image */}
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-xl border border-border/60">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    data-ai-hint={article.imageHint}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Key Takeaways Box */}
                {article.keyTakeaways && article.keyTakeaways.length > 0 && (
                  <div className="p-6 sm:p-8 rounded-2xl bg-primary/[0.05] border border-primary/30 space-y-4">
                    <div className="flex items-center gap-2 text-primary font-headline font-bold text-sm sm:text-base tracking-wide">
                      <Sparkles className="h-4 w-4" />
                      <span>Key Takeaways &amp; Executive Summary</span>
                    </div>
                    <ul className="grid grid-cols-1 gap-2.5">
                      {article.keyTakeaways.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Rich HTML Content Body */}
                <div
                  className="prose prose-neutral dark:prose-invert max-w-none 
                    [&_h2]:text-2xl sm:[&_h2]:text-3xl [&_h2]:font-headline [&_h2]:font-bold [&_h2]:text-primary [&_h2]:mt-10 [&_h2]:mb-4
                    [&_h3]:text-xl [&_h3]:font-headline [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2
                    [&_p]:text-sm sm:[&_p]:text-base [&_p]:leading-relaxed [&_p]:text-foreground/90 [&_p]:mb-5
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ul]:mb-6 [&_li]:text-sm sm:[&_li]:text-base [&_li]:text-foreground/90
                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2 [&_ol]:mb-6 [&_li]:text-sm sm:[&_li]:text-base [&_li]:text-foreground/90
                    [&_strong]:text-foreground [&_strong]:font-semibold
                  "
                  dangerouslySetInnerHTML={{ __html: article.contentHtml }}
                />

                {/* Article Footer & Author Box */}
                <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-primary/40">
                      <Image
                        src={article.author.avatar}
                        alt={article.author.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-primary font-semibold">Written by</p>
                      <h4 className="text-sm font-bold text-foreground">{article.author.name}</h4>
                      <p className="text-xs text-muted-foreground">{article.author.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="rounded-full text-xs gap-1.5 border-border hover:bg-primary/10 hover:text-primary">
                      <a href={`https://wa.me/?text=${encodeURIComponent(`${article.title} - https://sapphiretrails.lk/articles/${article.slug}`)}`} target="_blank" rel="noopener noreferrer">
                        <Share2 className="h-3.5 w-3.5" />
                        Share Article
                      </a>
                    </Button>
                  </div>
                </div>

              </article>

              {/* Right Sidebar Column */}
              <aside className="lg:col-span-4 space-y-8 sticky top-28">
                
                {/* 1. Real Live Dynamic Tour Packages from Database */}
                {tours && tours.length > 0 ? (
                  <div className="space-y-6">
                    {tours.slice(0, 2).map((tour) => (
                      <Card key={tour.id} className="bg-card border border-primary/30 rounded-2xl overflow-hidden shadow-lg">
                        <div className="relative h-44 w-full">
                          <Image
                            src={tour.imageUrl || "https://content-provider.payshia.com/sapphire-trail/images/img2.webp"}
                            alt={tour.imageAlt || tour.homepageTitle}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-white">
                            {tour.duration || 'Full Day Expedition'}
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <p className="text-xs text-primary font-semibold uppercase tracking-wider font-serif">Featured Tour</p>
                            <h4 className="text-base font-headline font-bold leading-tight line-clamp-1">{tour.homepageTitle}</h4>
                          </div>
                        </div>
                        <CardContent className="p-5 space-y-4">
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {tour.homepageDescription}
                          </p>
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="text-lg font-bold font-serif text-primary">
                              {tour.price} <span className="text-xs text-muted-foreground font-normal">{tour.priceSuffix || '/ Person'}</span>
                            </span>
                            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-5 text-xs shadow-md">
                              <Link href={`/tours/${tour.slug}/book`}>
                                <CalendarCheck className="mr-1.5 h-3.5 w-3.5" />
                                Book Now
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : null}

                {/* 2. 24/7 WhatsApp Concierge Box */}
                <div className="p-6 rounded-2xl bg-background-alt border border-border/80 space-y-3">
                  <div className="flex items-center gap-2 text-foreground font-headline font-bold text-sm">
                    <MessageCircle className="h-4 w-4 text-emerald-500" />
                    <span>Have Questions for a Gemologist?</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Our luxury concierge team is available 24/7 on WhatsApp to answer inquiries regarding stone authentication or custom itineraries.
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full rounded-full border-primary/40 text-primary hover:bg-primary/10 text-xs h-9 font-semibold">
                    <a href="https://wa.me/94712357700" target="_blank" rel="noopener noreferrer">
                      Chat on WhatsApp (+94 71 235 7700)
                    </a>
                  </Button>
                </div>

                {/* 3. More Journal Articles */}
                {otherArticles.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <h3 className="text-base font-headline font-bold tracking-wide text-foreground flex items-center justify-between">
                      <span>Related Field Guides</span>
                      <Link href="/articles" className="text-xs text-primary hover:underline font-normal">View All</Link>
                    </h3>
                    <div className="space-y-3.5">
                      {otherArticles.map(item => (
                        <Link 
                          key={item.slug} 
                          href={`/articles/${item.slug}`}
                          className="group flex items-center gap-3.5 p-2.5 rounded-xl border border-border/60 hover:border-primary/40 bg-card hover:bg-background-alt transition-all"
                        >
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">{item.category}</span>
                            <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                              {item.title}
                            </h4>
                            <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {item.readTime}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              </aside>

            </div>
          </div>
        </section>

      </main>

      <TrustSection />
      <Footer />
    </div>
  );
}
