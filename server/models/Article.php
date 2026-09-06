<?php

class Article
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->ensureTableExists();
    }

    private function ensureTableExists()
    {
        $sql = "CREATE TABLE IF NOT EXISTS `articles` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `slug` VARCHAR(255) NOT NULL UNIQUE,
            `title` VARCHAR(255) NOT NULL,
            `subtitle` TEXT NULL,
            `description` TEXT NULL,
            `image_url` TEXT NULL,
            `image_hint` VARCHAR(255) NULL,
            `category` VARCHAR(100) NOT NULL,
            `read_time` VARCHAR(50) DEFAULT '5 min read',
            `published_date` VARCHAR(100) NULL,
            `author_name` VARCHAR(150) NULL,
            `author_role` VARCHAR(150) NULL,
            `author_avatar` TEXT NULL,
            `key_takeaways` JSON NULL,
            `content_html` LONGTEXT NULL,
            `status` ENUM('published', 'draft') DEFAULT 'published',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        
        $this->pdo->exec($sql);
        $this->seedInitialArticlesIfEmpty();
    }

    private function seedInitialArticlesIfEmpty()
    {
        $count = $this->pdo->query("SELECT COUNT(*) FROM `articles`")->fetchColumn();
        if ($count > 0) {
            return;
        }

        $initialArticles = [
            [
                'slug' => 'guide-to-ratnapura-gems',
                'title' => 'The Definitive Guide to Ratnapura Gems: Ceylon Sapphires, Padparadscha & Ancient Gravels',
                'subtitle' => 'An insider look into the geological treasures of Sri Lanka’s City of Gems, from raw illam extraction to international lab grading standards.',
                'description' => 'Discover the world-famous gemstones of Ratnapura. Learn about natural Ceylon Blue Sapphires, Padparadscha, Star Stones, heat treatments, market valuation, and how to safely navigate the gem capital.',
                'image_url' => 'https://content-provider.payshia.com/sapphire-trail/images/img37.webp',
                'image_hint' => 'colorful gemstones collection Ceylon',
                'category' => 'Gemology & Valuation',
                'read_time' => '6 min read',
                'published_date' => 'February 2026',
                'author_name' => 'Dr. Rohan Samarasinghe, FGA',
                'author_role' => 'Chief Gemological Consultant',
                'author_avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
                'key_takeaways' => [
                    'Ratnapura produces over 75 distinct gemstone varieties from an ancient alluvial gravel layer called "Illam".',
                    'Sri Lankan Royal Blue and Cornflower Blue Sapphires are celebrated globally for exceptional brilliance and light dispersion.',
                    'The legendary Padparadscha ("lotus blossom") sapphire is native to Sri Lanka and commands the highest per-carat prices.',
                    'Always insist on recognized international laboratory certificates (GIA, GIC, Lotus, SSEF) when acquiring unheated stones.'
                ],
                'content_html' => '<p class="lead text-lg md:text-xl font-normal text-foreground/90 leading-relaxed">Nestled in the mist-shrouded foothills of the Adam’s Peak mountain range lies <strong>Ratnapura</strong>—a city whose very name translates to <em>"The City of Gems"</em> in Sanskrit. For over two millennia, this legendary valley has supplied monarchies, royal jewelers, and auction houses with the world’s most mesmerizing corundum treasures.</p><h2>The Geological Miracle of "Illam" Gravels</h2><p>Unlike diamond mines in Africa or emerald deposits in Colombia which are frequently extracted from hard rock kimberlite pipes, Ratnapura’s gemstones are predominantly <strong>alluvial deposits</strong>. Hundreds of millions of years of monsoonal weathering eroded ancient pegmatite veins high in the central highlands, washing heavy gemstone crystals down into ancient riverbeds.</p><p>Today, these precious crystals sit compressed within a subterranean, clay-rich gravel stratum known locally as <strong>"Illam"</strong> (ඉල්ලම), buried anywhere from 15 to 80 feet beneath lush paddy fields and river floodplains.</p><div class="my-8 p-6 rounded-2xl bg-primary/[0.06] border border-primary/30 not-prose"><div class="flex items-start gap-3.5"><div class="p-2.5 rounded-xl bg-primary text-primary-foreground"><Gem class="h-5 w-5" /></div><div><h4 class="font-headline font-bold text-foreground text-base">The Royal Heritage of Ceylon Sapphires</h4><p class="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">Ceylon Sapphires have adorned the British Imperial State Crown, King Solomon’s courtship gifts to the Queen of Sheba, and famously, the 12-carat oval Ceylon Blue Sapphire engagement ring worn by Princess Diana and Catherine, Princess of Wales.</p></div></div></div><h2>Signature Gemstones Uncovered in Ratnapura</h2><p>While sapphires reign supreme, the diversity of mineral species extracted across Ratnapura is unrivaled anywhere on Earth. Here are the crown jewels of the region:</p><h3>1. Ceylon Blue Sapphire (Royal Blue & Cornflower Blue)</h3><p>Celebrated for its distinct velvety luminosity, Ceylon blue sapphire tends to have a lighter, more vibrant primary hue than dark Australian stones or inky Thai corundum. The two most sought-after color grades are <em>"Cornflower Blue"</em> (a luminous pastel blue with soft violet undertones) and <em>"Royal Blue"</em> (a rich, vivid deep cobalt blue).</p><h3>2. Padparadscha Sapphire (The Lotus Blossom)</h3><p>Derived from the Sinhalese word <em>"Padmaraga"</em> (the color of a tropical lotus flower at sunset), this is the rarest and most valuable sapphire variety on Earth. A true Padparadscha must showcase a delicate, unseparated blend of pink and orange simultaneously.</p><h3>3. Star Sapphires & Star Rubies (Asterism)</h3><p>When microscopic rutile silk needles align along the hexagonal crystal axes of corundum, cutting the stone into a smooth cabochon reveals a sharp, dancing 6-ray star when illuminated by direct light. Sri Lanka holds the world record for the largest star sapphires ever unearthed (including the 1404-carat Star of Adam).</p><h3>4. Chrysoberyl Cat’s Eye & Alexandrite</h3><p>Ratnapura produces world-class Chrysoberyl with phenomenal razor-sharp <em>"milk and honey"</em> chatoyancy (Cat’s Eye), as well as color-changing <strong>Alexandrite</strong>—which shifts from emerald green in daylight to ruby red under incandescent light.</p><h2>Unheated vs. Heat-Treated Sapphires: The Valuation Factor</h2><p>Understanding thermal enhancement is crucial for any collector or traveler. Traditional thermal treatment (often conducted with high-temperature blowpipes or electrical furnaces) dissolves rutile silk to improve clarity and enrich color tone.</p><ul><li><strong>Unheated (Natural):</strong> Completely untreated straight from the earth. Represents less than 1% of top-grade market output and commands a 50% to 200%+ premium among collectors.</li><li><strong>Standard Heat-Treated:</strong> A universally accepted, permanent, and stable industry practice that optimizes natural beauty without synthetic glass fillers.</li></ul><h2>How to Safely Experience the Mines and Acquire Gems</h2><p>Navigating the gem trade requires specialized insider access. On a <strong>Sapphire Trails VIP Expedition</strong>, travelers receive:</p><ol><li>Direct descent into licensed, timbered mining shafts with full safety harnesses and helmets.</li><li>Hands-on gravel washing (Garilla) alongside local miners using ancient conical cane baskets.</li><li>Guided walkthroughs of the morning street trading bazaar with optical torch inspection demonstrations.</li><li>Access to private lapidary workshops and certified gemological testing laboratories (with GIA, GIC, or Lotus certification).</li></ol><div class="mt-8 p-6 rounded-2xl bg-card border border-border not-prose flex flex-col sm:flex-row items-center justify-between gap-4"><div><h4 class="font-headline font-bold text-foreground text-base">Plan Your Private Ratnapura Expedition</h4><p class="text-xs text-muted-foreground mt-0.5">Explore active pits, historic riverbeds, and gem laboratories in total luxury.</p></div><a href="/tours/exclusive-gem-mining-tour/book" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-transform hover:scale-105 shadow-md">Book Mining Expedition</a></div>',
                'status' => 'published'
            ],
            [
                'slug' => 'complete-guide-to-gem-tour-experience',
                'title' => 'The Complete Guide to Your Next Gem Tour Experience in Sri Lanka',
                'subtitle' => 'From timbered underground shafts to traditional wicker basket river washing—everything to expect on an authentic expedition.',
                'description' => 'An exhaustive walkthrough of what happens on a luxury gem mining tour in Ratnapura, Sri Lanka. Dress codes, safety gear, pit descent, and street trading protocols.',
                'image_url' => 'https://content-provider.payshia.com/sapphire-trail/images/img2.webp',
                'image_hint' => 'active gem mining pit experience',
                'category' => 'Expedition Guide',
                'read_time' => '5 min read',
                'published_date' => 'February 2026',
                'author_name' => 'Chaminda Wijesinghe',
                'author_role' => 'Lead Expedition Guide & Naturalist',
                'author_avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
                'key_takeaways' => [
                    'Safety harnesses and boots are provided for all guests descending active shafts.',
                    'Experience traditional stream washing to separate heavy gemstone gravel.',
                    'Visit local lapidary masters who precision-cut rough stones using traditional wooden gem wheels.',
                    'Pickups are available directly from Colombo, Galle, Bentota, and Kandy in luxury AC vehicles.'
                ],
                'content_html' => '<p class="lead text-lg md:text-xl font-normal text-foreground/90 leading-relaxed">Visiting an active Ceylon gem mine is unlike any standard tourist excursion. It is a sensory immersion into a living craft that has remained virtually unchanged since the days of Sinbad the Sailor and Marco Polo.</p><h2>Morning Preparation & Luxury Private Transfer</h2><p>Your expedition begins with an early morning pickup from your hotel or villa in a private luxury air-conditioned vehicle. As you leave the coastal lowlands, the scenery ascends into lush rubber plantations, cascading streams, and emerald tea terraces before descending into the fertile Ratnapura river basin.</p><h2>Safety Briefing & Shaft Descent</h2><p>At our government-licensed partner mine, you are outfitted with sanitized safety helmets, headlamps, and harnesses. Accompanied by our licensed gemologist and veteran pit masters, you will:</p><ul><li>Inspect the traditional timbered framework constructed with rubberwood and fern leaves to prevent cave-ins.</li><li>Observe the ancient manual bucket winch system used to hoist mud and Illam gravel to the surface.</li><li>Descend into active tunnels to witness how miners locate the gravel vein using hand picks and chisel rods.</li></ul><h2>The Art of Traditional River Washing (Garilla)</h2><p>Once the Illam gravel is brought to the surface, it is transported to a nearby mountain stream or washing pool. You will step into the shallow waters and learn the rhythmic circular swirling motion using traditional conical bamboo baskets (<em>Wattiya</em>). The swirling action causes lighter sand and mud to wash over the rim, leaving dense garnet, tourmaline, zircon, and sapphire crystals settled at the apex.</p><h2>The Morning Street Gem Bazaar</h2><p>Next, we visit the historic Ratnapura open-air gem street market. Here, hundreds of independent miners and gem merchants gather each morning. You will observe the secretive hand-signal bargaining rituals concealed under handkerchiefs and watch master traders inspect stones against the morning sunlight with 10x achromatic loupes.</p>',
                'status' => 'published'
            ],
            [
                'slug' => 'visiting-ratnapura-gem-market',
                'title' => 'A Pro’s Guide to the Ratnapura Gem Market: Street Trading Secrets & Protocols',
                'subtitle' => 'How rough and cut sapphires change hands in the world’s most dynamic open-air gem bazaar.',
                'description' => 'Learn the unwritten etiquette of the Ratnapura gem street market. Optical torch testing, bargaining signals, and tips for collectors.',
                'image_url' => 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp',
                'image_hint' => 'gemstones collection street market',
                'category' => 'Market Insights',
                'read_time' => '4 min read',
                'published_date' => 'January 2026',
                'author_name' => 'Dr. Rohan Samarasinghe, FGA',
                'author_role' => 'Chief Gemological Consultant',
                'author_avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
                'key_takeaways' => [
                    'The morning street market operates between 8:00 AM and 12:00 PM along Main Street.',
                    'Traders use small specialized LED optical torches and immersion liquids to inspect internal crystal inclusions.',
                    'Never touch a stone that is currently being inspected by another dealer until they have handed it back.',
                    'Our guests are accompanied by a licensed gemologist to translate and explain every transaction in real-time.'
                ],
                'content_html' => '<p class="lead text-lg md:text-xl font-normal text-foreground/90 leading-relaxed">Every morning between 8:00 AM and midday, the narrow streets of Ratnapura transform into the beating heart of the global sapphire trade. Merchants from Japan, Europe, Dubai, and Hong Kong mingle with local miners who have just emerged from the pits.</p><h2>The Rhythm of the Morning Bazaar</h2><p>Unlike retail boutiques with velvet trays and display cases, the Ratnapura street market takes place directly on the sidewalks. Deals are conducted informally, with stones wrapped in neat triangular paper packets (<em>Patthu</em>).</p><h2>Optical Inspection Techniques</h2><p>Experienced buyers rely on portable 10x triplets and daylight-balanced optical torches. By placing the gemstone over a focused beam of light in a dark viewing corner or beneath a folded paper cone, experts can assess:</p><ul><li><strong>Color Zoning:</strong> How color is distributed throughout the crystal lattice.</li><li><strong>Silk & Inclusions:</strong> The presence of microscopic rutile needles that confirm unheated origin.</li><li><strong>Fractures & Cleavage:</strong> Internal fissures that determine how the rough stone will be oriented on the cutting wheel.</li></ul>',
                'status' => 'published'
            ],
            [
                'slug' => 'history-of-sri-lankan-gem-mining',
                'title' => 'The 2,500-Year Chronicle of Sri Lankan Gem Mining: From King Solomon to Modern Times',
                'subtitle' => 'How an island known to ancient Greeks as Taprobane and Arabs as Serendib became the cradle of global gemology.',
                'description' => 'Explore the 25-century history of Ceylon gem mining. Ancient royal chronicles, Marco Polo’s travel diaries, and sustainable hand-dug traditions.',
                'image_url' => 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp',
                'image_hint' => 'historic gem mine cave',
                'category' => 'Heritage & History',
                'read_time' => '5 min read',
                'published_date' => 'January 2026',
                'author_name' => 'Chaminda Wijesinghe',
                'author_role' => 'Lead Expedition Guide & Naturalist',
                'author_avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
                'key_takeaways' => [
                    'Sri Lanka is one of the oldest recorded continuous sources of precious gemstones in human history.',
                    'Sinbad the Sailor’s mythical "Valley of Gems" in One Thousand and One Nights was inspired by Ratnapura.',
                    'Traditional mining in Sri Lanka remains environmentally sustainable, relying on manual excavation rather than destructive open-pit machinery.',
                    'All mining pits are legally required to be refilled and replanted after extraction to preserve the ecosystem.'
                ],
                'content_html' => '<p class="lead text-lg md:text-xl font-normal text-foreground/90 leading-relaxed">When Marco Polo visited Ceylon in the 13th century, he wrote: <em>"The island produces more precious stones than any other spot on Earth—sapphires, topazes, amethysts, and rubies beyond measure."</em></p><h2>Ancient Chronicles & The Silk Road</h2><p>Sri Lanka’s gem heritage predates the Common Era. The Mahavamsa chronicle notes that gems from Ratnapura were sent as diplomatic gifts by King Devanampiya Tissa to Emperor Ashoka of India in 250 BCE. Roman historian Pliny the Elder recorded that gemstones from Taprobane were prized above all others by Roman patricians.</p><h2>Preserving Sustainable Hand-Mining Traditions</h2><p>Unlike industrial open-cast diamond and gold mining in other regions which leave massive scars on the earth, Sri Lanka’s gem mining laws strictly mandate artisanal, hand-dug methods. This ensures that:</p><ul><li>Water tables are protected from toxic industrial runoffs.</li><li>Local mining communities retain ownership and share direct profits from every strike.</li><li>Land is restored, refilled, and re-cultivated with paddy or cinnamon crops once the vein is depleted.</li></ul>',
                'status' => 'published'
            ]
        ];

        foreach ($initialArticles as $article) {
            $this->create($article);
        }
    }

    public function getAll($status = null)
    {
        if ($status) {
            $stmt = $this->pdo->prepare("SELECT * FROM `articles` WHERE `status` = ? ORDER BY `created_at` DESC");
            $stmt->execute([$status]);
        } else {
            $stmt = $this->pdo->prepare("SELECT * FROM `articles` ORDER BY `created_at` DESC");
            $stmt->execute();
        }

        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($items as &$item) {
            if (isset($item['key_takeaways']) && is_string($item['key_takeaways'])) {
                $item['key_takeaways'] = json_decode($item['key_takeaways'], true) ?: [];
            }
        }
        return $items;
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `articles` WHERE `id` = ?");
        $stmt->execute([$id]);
        $item = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($item && isset($item['key_takeaways']) && is_string($item['key_takeaways'])) {
            $item['key_takeaways'] = json_decode($item['key_takeaways'], true) ?: [];
        }
        return $item ?: null;
    }

    public function getBySlug($slug)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `articles` WHERE `slug` = ?");
        $stmt->execute([$slug]);
        $item = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($item && isset($item['key_takeaways']) && is_string($item['key_takeaways'])) {
            $item['key_takeaways'] = json_decode($item['key_takeaways'], true) ?: [];
        }
        return $item ?: null;
    }

    public function create($data)
    {
        $slug = !empty($data['slug']) ? $this->generateSlug($data['slug']) : $this->generateSlug($data['title']);

        $keyTakeaways = is_array($data['key_takeaways']) 
            ? json_encode($data['key_takeaways']) 
            : ($data['key_takeaways'] ?? json_encode([]));

        $stmt = $this->pdo->prepare("
            INSERT INTO `articles` (
                `slug`, `title`, `subtitle`, `description`, `image_url`, `image_hint`,
                `category`, `read_time`, `published_date`, `author_name`, `author_role`,
                `author_avatar`, `key_takeaways`, `content_html`, `status`, `created_at`, `updated_at`
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ");

        $stmt->execute([
            $slug,
            $data['title'] ?? '',
            $data['subtitle'] ?? null,
            $data['description'] ?? null,
            $data['image_url'] ?? null,
            $data['image_hint'] ?? null,
            $data['category'] ?? 'General',
            $data['read_time'] ?? '5 min read',
            $data['published_date'] ?? date('F Y'),
            $data['author_name'] ?? 'Editorial Team',
            $data['author_role'] ?? 'Contributor',
            $data['author_avatar'] ?? null,
            $keyTakeaways,
            $data['content_html'] ?? null,
            $data['status'] ?? 'published'
        ]);

        return $this->pdo->lastInsertId();
    }

    public function update($id, $data)
    {
        $existing = $this->getById($id);
        if (!$existing) {
            return false;
        }

        $slug = !empty($data['slug']) ? $this->generateSlug($data['slug'], $id) : $existing['slug'];

        $keyTakeaways = is_array($data['key_takeaways']) 
            ? json_encode($data['key_takeaways']) 
            : ($data['key_takeaways'] ?? json_encode([]));

        $stmt = $this->pdo->prepare("
            UPDATE `articles` SET
                `slug` = ?,
                `title` = ?,
                `subtitle` = ?,
                `description` = ?,
                `image_url` = ?,
                `image_hint` = ?,
                `category` = ?,
                `read_time` = ?,
                `published_date` = ?,
                `author_name` = ?,
                `author_role` = ?,
                `author_avatar` = ?,
                `key_takeaways` = ?,
                `content_html` = ?,
                `status` = ?,
                `updated_at` = NOW()
            WHERE `id` = ?
        ");

        $stmt->execute([
            $slug,
            $data['title'] ?? $existing['title'],
            $data['subtitle'] ?? $existing['subtitle'],
            $data['description'] ?? $existing['description'],
            $data['image_url'] ?? $existing['image_url'],
            $data['image_hint'] ?? $existing['image_hint'],
            $data['category'] ?? $existing['category'],
            $data['read_time'] ?? $existing['read_time'],
            $data['published_date'] ?? $existing['published_date'],
            $data['author_name'] ?? $existing['author_name'],
            $data['author_role'] ?? $existing['author_role'],
            $data['author_avatar'] ?? $existing['author_avatar'],
            $keyTakeaways,
            $data['content_html'] ?? $existing['content_html'],
            $data['status'] ?? $existing['status'],
            $id
        ]);

        return true;
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `articles` WHERE `id` = ?");
        return $stmt->execute([$id]);
    }

    private function generateSlug($text, $currentId = null)
    {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $text)));
        $slug = trim($slug, '-');
        if (empty($slug)) {
            $slug = 'article-' . time();
        }

        $sql = "SELECT COUNT(*) FROM `articles` WHERE `slug` = ?";
        $params = [$slug];
        if ($currentId) {
            $sql .= " AND `id` != ?";
            $params[] = $currentId;
        }

        $stmt = $this->pdo->prepare($sql);
        $originalSlug = $slug;
        $i = 1;
        while (true) {
            $stmt->execute($params);
            if ($stmt->fetchColumn() == 0) {
                break;
            }
            $slug = $originalSlug . '-' . $i++;
            $params[0] = $slug;
        }

        return $slug;
    }
}
