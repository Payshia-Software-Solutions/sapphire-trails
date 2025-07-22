<?php
require_once __DIR__ . '/TourExperienceGallery.php';

class TourPackage
{
    private $pdo;
    private $tourItinerary;
    private $experienceGallery;

    public function __construct($pdo, $tourItinerary)
    {
        $this->pdo = $pdo;
        $this->tourItinerary = $tourItinerary;
        $this->experienceGallery = new TourExperienceGallery($pdo);
    }

    public function getAll()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM tour_packages");
        $stmt->execute();
        $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($packages as &$pkg) {
            $pkg['highlights'] = $this->getHighlights($pkg['id']);
            $pkg['inclusions'] = $this->getInclusions($pkg['id']);
            $pkg['itinerary'] = $this->tourItinerary->getByTourPackageId($pkg['id']);
            $pkg['experience_gallery'] = $this->experienceGallery->getByTourPackageId($pkg['id']);
        }

        return $packages;
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM tour_packages WHERE id = ?");
        $stmt->execute([$id]);
        $pkg = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($pkg) {
            $pkg['highlights'] = $this->getHighlights($id);
            $pkg['inclusions'] = $this->getInclusions($id);
            $pkg['itinerary'] = $this->tourItinerary->getByTourPackageId($id);
            $pkg['experience_gallery'] = $this->experienceGallery->getByTourPackageId($id);
        }

        return $pkg;
    }
    
    public function getBySlug($slug)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM tour_packages WHERE slug = ?");
        $stmt->execute([$slug]);
        $pkg = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($pkg) {
            $pkg['highlights'] = $this->getHighlights($pkg['id']);
            $pkg['inclusions'] = $this->getInclusions($pkg['id']);
            $pkg['itinerary'] = $this->tourItinerary->getByTourPackageId($pkg['id']);
            $pkg['experience_gallery'] = $this->experienceGallery->getByTourPackageId($pkg['id']);
        }

        return $pkg;
    }

    public function create($data)
    {
        $slug = $this->generateSlug($data['homepage_title']);

        $stmt = $this->pdo->prepare("
            INSERT INTO tour_packages (
                slug, homepage_title, homepage_description, homepage_image_url,
                homepage_image_alt, homepage_image_hint, tour_page_title, duration, price,
                price_suffix, hero_image_url, hero_image_hint, tour_page_description, booking_link,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ");

        $stmt->execute([
            $slug,
            $data['homepage_title'], $data['homepage_description'], $data['homepage_image_url'],
            $data['homepage_image_alt'], $data['homepage_image_hint'], $data['tour_page_title'],
            $data['duration'], $data['price'], $data['price_suffix'], $data['hero_image_url'],
            $data['hero_image_hint'], $data['tour_page_description'], $data['booking_link']
        ]);

        $packageId = $this->pdo->lastInsertId();

        $this->insertHighlights($packageId, $data['highlights']);
        $this->insertInclusions($packageId, $data['inclusions']);
        $this->insertExperienceGallery($packageId, $data['experience_gallery']);

        foreach ($data['itinerary'] as $item) {
            $item['tour_package_id'] = $packageId;
            $this->tourItinerary->create($item);
        }

        return $packageId;
    }
    
    public function update($id, $data) {
        $stmt = $this->pdo->prepare("
            UPDATE tour_packages SET
                homepage_title = :homepage_title,
                homepage_description = :homepage_description,
                homepage_image_url = :homepage_image_url,
                homepage_image_alt = :homepage_image_alt,
                homepage_image_hint = :homepage_image_hint,
                tour_page_title = :tour_page_title,
                duration = :duration,
                price = :price,
                price_suffix = :price_suffix,
                hero_image_url = :hero_image_url,
                hero_image_hint = :hero_image_hint,
                tour_page_description = :tour_page_description,
                booking_link = :booking_link,
                updated_at = NOW()
            WHERE id = :id
        ");

        $stmt->execute([
            ':id' => $id,
            ':homepage_title' => $data['homepage_title'],
            ':homepage_description' => $data['homepage_description'],
            ':homepage_image_url' => $data['homepage_image_url'],
            ':homepage_image_alt' => $data['homepage_image_alt'],
            ':homepage_image_hint' => $data['homepage_image_hint'],
            ':tour_page_title' => $data['tour_page_title'],
            ':duration' => $data['duration'],
            ':price' => $data['price'],
            ':price_suffix' => $data['price_suffix'],
            ':hero_image_url' => $data['hero_image_url'],
            ':hero_image_hint' => $data['hero_image_hint'],
            ':tour_page_description' => $data['tour_page_description'],
            ':booking_link' => $data['booking_link']
        ]);

        // Clear and re-insert related data
        $this->pdo->prepare("DELETE FROM tour_highlights WHERE tour_package_id = ?")->execute([$id]);
        $this->pdo->prepare("DELETE FROM tour_inclusions WHERE tour_package_id = ?")->execute([$id]);
        $this->pdo->prepare("DELETE FROM tour_itinerary WHERE tour_package_id = ?")->execute([$id]);
        $this->experienceGallery->deleteByTourPackageId($id);

        $this->insertHighlights($id, $data['highlights']);
        $this->insertInclusions($id, $data['inclusions']);
        $this->insertExperienceGallery($id, $data['experience_gallery']);

        foreach ($data['itinerary'] as $item) {
            $item['tour_package_id'] = $id;
            $this->tourItinerary->create($item);
        }

        return $stmt->rowCount();
    }


    public function updateImagePaths($id, $homepageImageUrl, $heroImageUrl)
    {
        $stmt = $this->pdo->prepare("
            UPDATE tour_packages
            SET homepage_image_url = ?, hero_image_url = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$homepageImageUrl, $heroImageUrl, $id]);
    }

    public function delete($id)
    {
        $this->pdo->prepare("DELETE FROM tour_highlights WHERE tour_package_id = ?")->execute([$id]);
        $this->pdo->prepare("DELETE FROM tour_inclusions WHERE tour_package_id = ?")->execute([$id]);
        $this->experienceGallery->deleteByTourPackageId($id);
        $this->tourItinerary->deleteByTourPackageId($id);
        $this->pdo->prepare("DELETE FROM tour_packages WHERE id = ?")->execute([$id]);
    }

    private function getHighlights($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM tour_highlights WHERE tour_package_id = ? ORDER BY sort_order ASC");
        $stmt->execute([$id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getInclusions($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM tour_inclusions WHERE tour_package_id = ? ORDER BY sort_order ASC");
        $stmt->execute([$id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function insertHighlights($id, $items)
    {
        foreach ($items as $item) {
            $stmt = $this->pdo->prepare("
                INSERT INTO tour_highlights (tour_package_id, icon, title, description, sort_order)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $id,
                $item['icon'],
                $item['title'],
                $item['description'],
                $item['sort_order']
            ]);
        }
    }

    private function insertInclusions($id, $items)
    {
        foreach ($items as $item) {
            $stmt = $this->pdo->prepare("
                INSERT INTO tour_inclusions (tour_package_id, icon, title, description, sort_order)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $id,
                $item['icon'],
                $item['title'],
                $item['description'],
                $item['sort_order']
            ]);
        }
    }
    
    private function insertExperienceGallery($packageId, $galleryData) {
        if (!is_array($galleryData)) return;

        foreach ($galleryData as $item) {
            $this->experienceGallery->create([
                'tour_package_id' => $packageId,
                'image_url' => $item['image_url'],
                'alt_text' => $item['alt_text'],
                'hint' => $item['hint'],
                'sort_order' => $item['sort_order']
            ]);
        }
    }

    private function generateSlug($title)
    {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM tour_packages WHERE slug = ?");
        $originalSlug = $slug;
        $i = 1;
        while (true) {
            $stmt->execute([$slug]);
            if ($stmt->fetchColumn() == 0) break;
            $slug = $originalSlug . '-' . $i++;
        }
        return $slug;
    }
}
