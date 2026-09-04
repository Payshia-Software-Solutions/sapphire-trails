import { NextResponse } from 'next/server';

interface LocationGenerationRequest {
  title: string;
  category?: string;
  field?: 'all' | 'subtitle' | 'card_description' | 'intro' | 'highlights' | 'visitor_info' | 'seo';
}

const LUXURY_KNOWLEDGE_BASE: Record<string, any> = {
  'bopath ella falls': {
    subtitle: 'A Breathtaking Heart-Shaped Cascade of Sacred Legends',
    card_description: 'Cascading in the unique silhouette of a sacred Bo leaf, Bopath Ella is one of Sri Lanka’s most picturesque natural marvels, steeped in ancient folklore and surrounded by lush Sabaragamuwa wilderness.',
    intro_title: 'The Legendary Cascade of the Sacred Bo Leaf',
    intro_description: 'Named for its striking, near-perfect resemblance to the leaf of the sacred Bo tree (Ficus religiosa), Bopath Ella is a magnificent 30-meter waterfall that cascades through a narrow rocky cleft into a serene natural pool below. \n\nDeeply woven into local Sabaragamuwa folklore, ancient legends tell of hidden treasures guarded by spirits beneath the churning waters, and historical visits by Sri Lankan royalty seeking respite in its cool mountain mist. Located just a short drive from Ratnapura’s famous gem mining valleys, it offers travelers an enchanting blend of biodiversity, cool mountain breezes, and rich cultural heritage.',
    distance: '20 km from Ratnapura City Center',
    highlights: [
      { icon: 'Waves', title: 'Iconic Sacred Leaf Silhouette', description: 'Unique geological formation where cascading waters narrow and fan out like a Bo leaf.' },
      { icon: 'Mountain', title: 'Lush Forest Basin & Mist', description: 'Surrounded by verdant Sabaragamuwa rainforest flora and tranquil rocky streams.' },
      { icon: 'Gem', title: 'Proximity to Gem Valleys', description: 'Located near historical alluvial mining basins rich with Ceylon sapphires.' },
      { icon: 'Camera', title: 'Panoramic Photography Decks', description: 'Multiple viewing points providing stunning vantage points of the waterfall plume.' }
    ],
    visitor_info: [
      { icon: 'Clock', title: 'Best Time to Visit', line1: '7:00 AM - 11:00 AM', line2: 'Early morning offers crisp light and fewer crowds' },
      { icon: 'CalendarDays', title: 'Ideal Season', line1: 'November to April', line2: 'Post-monsoon water volume is at its most spectacular' },
      { icon: 'Ticket', title: 'Access & Facilities', line1: 'Nominal Entry Ticket', line2: 'Paved walkways and local refreshment stalls available' },
      { icon: 'ShieldCheck', title: 'Safety Guidelines', line1: 'Designated Viewing Areas', line2: 'Swim only in marked safe zones with a local guide' }
    ],
    meta_title: 'Explore Bopath Ella Falls | Ratnapura Gem Tour Attraction',
    meta_description: 'Discover Bopath Ella Falls in Ratnapura, Sri Lanka. Famous for its sacred Bo-leaf shape, rich folklore, and private luxury day tour experiences with Sapphire Trails.',
    meta_keywords: 'Bopath Ella Falls, Ratnapura waterfalls, Sri Lanka gem tour attractions, Bopath Ella tour, Sabaragamuwa nature'
  },
  'sinharaja rainforest': {
    subtitle: 'Sri Lanka’s UNESCO Crown Jewel of Virgin Tropical Rainforest',
    card_description: 'A primordial biodiversity hotspot teeming with rare endemic wildlife, towering emerald canopies, and crystal-clear mountain streams untouched by time.',
    intro_title: 'Journey into a Living Prehistoric Rainforest Sanctuary',
    intro_description: 'As Sri Lanka’s last remaining viable area of primary tropical rainforest, Sinharaja is a UNESCO World Heritage Site and Biosphere Reserve of global significance. More than 60% of the trees are endemic, and many are considered rare.\n\nTrekking beneath the dense multi-tiered canopy accompanied by a specialist naturalist guide reveals mixed-species bird feeding flocks, glowing endemic purple-faced langurs, vibrant orchids, and pristine waterfalls flowing through moss-draped riverbeds.',
    distance: '45 km from Ratnapura City Center',
    highlights: [
      { icon: 'Leaf', title: 'UNESCO Biosphere Reserve', description: 'Over 60% of plant and tree species are found nowhere else on earth.' },
      { icon: 'Bird', title: 'Mixed-Species Bird Flocks', description: 'Renowned for the world’s largest and most active bird flocking phenomena.' },
      { icon: 'Waves', title: 'Pristine Jungle Waterfalls', description: 'Hidden forest cascades providing crystal-clear natural swimming pools.' },
      { icon: 'Compass', title: 'Guided Private Trekking', description: 'Led by certified expert naturalists for safety and deep wildlife spotting.' }
    ],
    visitor_info: [
      { icon: 'Clock', title: 'Trek Timings', line1: '6:30 AM - 5:00 PM', line2: 'Morning treks best for endemic bird watching' },
      { icon: 'CalendarDays', title: 'Best Season', line1: 'December to April', line2: 'Drier months offer clearer forest trails' },
      { icon: 'Ticket', title: 'Permit & Guide', line1: 'Wildlife Dept. Permit', line2: 'Official tracker guide required for all visitors' },
      { icon: 'ShieldCheck', title: 'Recommended Gear', line1: 'Leech socks & Raincoat', line2: 'Comfortable hiking shoes and waterproof bags' }
    ],
    meta_title: 'Sinharaja Rainforest Expedition | UNESCO World Heritage Tour',
    meta_description: 'Experience a private chauffeured guided trek through Sinharaja Rainforest Reserve with Sapphire Trails. Endemic wildlife, rare birds, and virgin wilderness.',
    meta_keywords: 'Sinharaja Rainforest, UNESCO Sri Lanka, Ratnapura nature tour, Sinharaja bird watching, Sri Lanka eco tour'
  }
};

export async function POST(request: Request) {
  try {
    const body: LocationGenerationRequest = await request.json();
    const title = (body.title || '').trim();
    const category = body.category || 'nature';
    const field = body.field || 'all';

    if (!title) {
      return NextResponse.json({ error: 'Destination title is required to generate content.' }, { status: 400 });
    }

    const titleLower = title.toLowerCase();

    // Check if we have tuned bespoke knowledge
    let matchedData = LUXURY_KNOWLEDGE_BASE[titleLower];

    // If not exact match, generate dynamic contextual luxury content based on name & category
    if (!matchedData) {
      const isMining = category === 'agriculture' || titleLower.includes('gem') || titleLower.includes('mine') || titleLower.includes('market');
      const isCultural = category === 'cultural' || titleLower.includes('temple') || titleLower.includes('devalaya') || titleLower.includes('cave') || titleLower.includes('museum');

      if (isMining) {
        matchedData = {
          subtitle: `Sri Lanka’s Fabled Valley of Precious Ceylon Sapphires`,
          card_description: `Step into the heart of Ceylon's legendary gem heritage at ${title}, where artisanal miners have unearthed world-renowned sapphires for centuries.`,
          intro_title: `Unearthing Centuries of Gemological Mastery & Rare Sapphires`,
          intro_description: `Situated in the historic gemstone belt of Ratnapura—the &quot;City of Gems&quot;—${title} represents an authentic window into traditional artisanal mining techniques that have remained virtually unchanged for over two thousand years.\n\nHere, skilled miners dig through deep alluvial gravel beds (illama) using timbered shafts and hand-woven cane baskets to extract corundum minerals including coveted Royal Blue Sapphires, Padparadscha, and Star Sapphires. A visit offers unprecedented insight into the journey of a gemstone from the earth to royal treasuries.`,
          distance: '12 km from Ratnapura City Center',
          highlights: [
            { icon: 'Gem', title: 'Traditional Illama Washing', description: 'Witness hand-washing of gem-bearing gravel in traditional conical cane baskets.' },
            { icon: 'Users', title: 'Artisanal Mining Heritage', description: 'Meet multi-generational miners and learn time-honored mining techniques.' },
            { icon: 'Award', title: 'Certified Ceylon Sapphires', description: 'Insight into natural rough gem identification and valuation.' },
            { icon: 'Sparkles', title: 'Private Gemologist Guide', description: 'Accompanied by licensed gemology specialists for authentic insights.' }
          ],
          visitor_info: [
            { icon: 'Clock', title: 'Active Mine Hours', line1: '8:30 AM - 3:30 PM', line2: 'Best viewed when washing pits are in full operation' },
            { icon: 'CalendarDays', title: 'Operating Days', line1: 'Monday to Saturday', line2: 'Traditional rest observed on religious poya days' },
            { icon: 'ShieldCheck', title: 'Visitor Protocol', line1: 'Private Access Allowed', line2: 'Safety boots and protective helmets provided' },
            { icon: 'Camera', title: 'Photography', line1: 'Permitted on Site', line2: 'Respect local miners and ask permission for portraits' }
          ],
          meta_title: `${title} | Ratnapura Ceylon Gem Tour Attraction`,
          meta_description: `Visit ${title} on a private luxury gem expedition with Sapphire Trails. Discover traditional sapphire mining, gravel washing, and local gem markets in Ratnapura.`,
          meta_keywords: `${title}, Ratnapura gem mines, Ceylon sapphire tours, Sri Lanka gem expedition, Sapphire Trails`
        };
      } else if (isCultural) {
        matchedData = {
          subtitle: `A Sacred Landmark of Ancient Royal Heritage & Spiritual Devotion`,
          card_description: `Immerse yourself in centuries of spiritual reverence, sacred architecture, and rich folklore at ${title} in the heart of Sabaragamuwa province.`,
          intro_title: `Where Ancient Kingdoms and Sacred Traditions Converge`,
          intro_description: `Steeped in centuries of recorded history, ${title} stands as a testament to the profound cultural and religious tapestry of Sri Lanka’s ancient kingdoms. \n\nAdorned with traditional Kandyan and Sabaragamuwa architectural motifs, intricate stone carvings, and tranquil sacred courtyards, this landmark has served as a sanctuary for pilgrims, scholars, and royalty seeking blessings and spiritual serenity amidst the verdant hills of Ratnapura.`,
          distance: '15 km from Ratnapura City Center',
          highlights: [
            { icon: 'Landmark', title: 'Historic Architecture', description: 'Exquisite traditional stone carvings, timber work, and ancient frescoes.' },
            { icon: 'Home', title: 'Sacred Sanctum & Relics', description: 'Revered spiritual grounds with centuries of uninterrupted rituals.' },
            { icon: 'CalendarDays', title: 'Annual Pageants & Festivities', description: 'Site of vibrant traditional processions and cultural rituals.' },
            { icon: 'Compass', title: 'Cultural Narrative Tour', description: 'Insightful historical storytelling by our private expert guides.' }
          ],
          visitor_info: [
            { icon: 'Clock', title: 'Opening Hours', line1: '6:00 AM - 7:30 PM', line2: 'Morning and evening pooja ceremonies are the most atmospheric' },
            { icon: 'ShieldCheck', title: 'Dress Code', line1: 'Modest White/Light Attire', line2: 'Cover shoulders and knees; remove footwear before entry' },
            { icon: 'Ticket', title: 'Entrance', line1: 'Free / Donation', line2: 'Voluntary donations support preservation of the site' },
            { icon: 'Camera', title: 'Photography Rules', line1: 'Courtyard Photos Allowed', line2: 'Do not pose with backs turned directly toward sacred shrines' }
          ],
          meta_title: `Visit ${title} | Cultural Landmark in Ratnapura`,
          meta_description: `Explore the sacred history and exquisite heritage of ${title} in Ratnapura with Sapphire Trails. Private guided cultural tours in Sri Lanka.`,
          meta_keywords: `${title}, Ratnapura cultural attractions, Sri Lanka heritage tours, Sabaragamuwa temples, Sapphire Trails`
        };
      } else {
        // Nature Default
        matchedData = {
          subtitle: `An Unspoiled Wilderness Sanctuary of Cascades & Mountain Mist`,
          card_description: `Explore the pristine tropical beauty of ${title}, featuring lush canopies, crystal-clear streams, and tranquil panoramic mountain vistas in Ratnapura.`,
          intro_title: `Discover the Untamed Natural Wonders of Sabaragamuwa`,
          intro_description: `Nestled amidst the mist-shrouded mountain ranges of the Sabaragamuwa province, ${title} is a pristine ecological haven offering travelers an escape into nature’s finest landscapes.\n\nFrom tranquil forest streams and refreshing cascading waters to vibrant endemic birdlife and towering tropical flora, a journey here is a rejuvenating blend of adventure, photography, and peaceful serenity away from the bustling city.`,
          distance: '18 km from Ratnapura City Center',
          highlights: [
            { icon: 'Mountain', title: 'Panoramic Mountain Scenery', description: 'Sweeping vistas across the lush valleys of the Sabaragamuwa province.' },
            { icon: 'Leaf', title: 'Tropical Flora & Fauna', description: 'Home to vibrant endemic butterflies, rare ferns, and lush forest canopy.' },
            { icon: 'Waves', title: 'Natural Freshwater Pools', description: 'Invigorating crystal-clear mountain water fed by highland rainfall.' },
            { icon: 'Camera', title: 'Scenic Photography Spots', description: 'Endless natural backdrops ideal for landscape and travel photography.' }
          ],
          visitor_info: [
            { icon: 'Clock', title: 'Best Time to Visit', line1: '7:30 AM - 4:30 PM', line2: 'Daylight hours offer the best light for hiking and photography' },
            { icon: 'CalendarDays', title: 'Ideal Months', line1: 'December to May', line2: 'Pleasant weather and minimal mountain rainfall' },
            { icon: 'ShieldCheck', title: 'Trail Difficulty', line1: 'Easy to Moderate', line2: 'Suitable for families and enthusiastic nature lovers' },
            { icon: 'Ticket', title: 'Guided Access', line1: 'Private Guide Advised', line2: 'Private air-conditioned chauffeur and nature guide included' }
          ],
          meta_title: `Explore ${title} | Ratnapura Nature Attraction`,
          meta_description: `Discover the breathtaking natural beauty of ${title} in Ratnapura with Sapphire Trails. Private guided day trips, photography tours, and nature walks.`,
          meta_keywords: `${title}, Ratnapura nature attractions, Sri Lanka waterfalls, eco tourism Ratnapura, Sapphire Trails`
        };
      }
    }

    if (field === 'all') {
      return NextResponse.json(matchedData);
    } else if (field in matchedData) {
      return NextResponse.json({ [field]: matchedData[field] });
    }

    return NextResponse.json(matchedData);

  } catch (error) {
    console.error('AI Content Generation Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content' },
      { status: 500 }
    );
  }
}
