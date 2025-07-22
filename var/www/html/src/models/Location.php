<?php
// Updated Location Model with Sub-Models Injected
class Location
{
    private $pdo;
    private $galleryImage;
    private $highlight;
    private $visitorInfo;
    private $nearbyAttractions;

    public function __construct($pdo, $galleryImage, $highlight, $visitorInfo, $nearbyAttractions)
    {
        $this->pdo = $pdo;
        $this->galleryImage = $galleryImage;
        $this->highlight = $highlight;
        $this->visitorInfo = $visitorInfo;
        $this->nearbyAttractions = $nearbyAttractions;
    }

    public function getAll()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM locations");
        $stmt->execute();
        $locations = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($locations as &$loc) {
            $loc['gallery_images'] = $this->galleryImage->getByLocationSlug($loc['slug']);
            $loc['highlights'] = $this->highlight->getByLocationSlug($loc['slug']);
            $loc['visitor_info'] = $this->visitorInfo->getByLocationSlug($loc['slug']);
            $loc['nearby_attractions'] = $this->nearbyAttractions->getByLocationSlug($loc['slug']);
        }

        return $locations;
    }

    public function getBySlug($slug)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM locations WHERE slug = ?");
        $stmt->execute([$slug]);
        $location = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($location) {
            $location['gallery_images'] = $this->galleryImage->getByLocationSlug($slug);
            $location['highlights'] = $this->highlight->getByLocationSlug($slug);
            $location['visitor_info'] = $this->visitorInfo->getByLocationSlug($slug);
            $location['nearby_attractions'] = $this->nearbyAttractions->getByLocationSlug($slug);
        }

        return $location;
    }

    public function create($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO locations (
            slug, title, subtitle, card_description, card_image_url, card_image_hint,
            distance, hero_image_url, hero_image_hint, intro_title, intro_description,
            intro_image_url, intro_image_hint, map_embed_url, category,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");

        $stmt->execute([
            $data['slug'], $data['title'], $data['subtitle'], $data['card_description'],
            $data['card_image_url'], $data['card_image_hint'], $data['distance'],
            $data['hero_image_url'], $data['hero_image_hint'], $data['intro_title'],
            $data['intro_description'], $data['intro_image_url'], $data['intro_image_hint'],
            $data['map_embed_url'], $data['category']
        ]);

        foreach ($data['highlights'] as $item) {
            $item['location_slug'] = $data['slug'];
            $this->highlight->create($item);
        }

        foreach ($data['visitor_info'] as $item) {
            $item['location_slug'] = $data['slug'];
            $this->visitorInfo->create($item);
        }

        foreach ($data['nearby_attractions'] as $item) {
            $item['location_slug'] = $data['slug'];
            $this->nearbyAttractions->create($item);
        }

        return $data['slug'];
    }


    public function delete($slug)
    {
        $this->galleryImage->deleteByLocationSlug($slug);
        $this->highlight->deleteByLocationSlug($slug);
        $this->visitorInfo->deleteByLocationSlug($slug);
        $this->nearbyAttractions->deleteByLocationSlug($slug);
        $stmt = $this->pdo->prepare("DELETE FROM locations WHERE slug = ?");
        $stmt->execute([$slug]);
    }

    public function update($slug, $data)
    {
        $sql = "UPDATE locations SET 
                    title = :title, 
                    subtitle = :subtitle, 
                    card_description = :card_description, 
                    card_image_hint = :card_image_hint,
                    distance = :distance, 
                    hero_image_hint = :hero_image_hint, 
                    intro_title = :intro_title, 
                    intro_description = :intro_description,
                    intro_image_hint = :intro_image_hint, 
                    map_embed_url = :map_embed_url, 
                    category = :category, 
                    updated_at = NOW()";

        // Conditionally add image URLs to the query if they are provided
        if (isset($data['card_image_url'])) {
            $sql .= ", card_image_url = :card_image_url";
        }
        if (isset($data['hero_image_url'])) {
            $sql .= ", hero_image_url = :hero_image_url";
        }
        if (isset($data['intro_image_url'])) {
            $sql .= ", intro_image_url = :intro_image_url";
        }

        $sql .= " WHERE slug = :slug";

        $stmt = $this->pdo->prepare($sql);

        // Bind parameters
        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':subtitle', $data['subtitle']);
        $stmt->bindParam(':card_description', $data['card_description']);
        $stmt->bindParam(':card_image_hint', $data['card_image_hint']);
        $stmt->bindParam(':distance', $data['distance']);
        $stmt->bindParam(':hero_image_hint', $data['hero_image_hint']);
        $stmt->bindParam(':intro_title', $data['intro_title']);
        $stmt->bindParam(':intro_description', $data['intro_description']);
        $stmt->bindParam(':intro_image_hint', $data['intro_image_hint']);
        $stmt->bindParam(':map_embed_url', $data['map_embed_url']);
        $stmt->bindParam(':category', $data['category']);
        $stmt->bindParam(':slug', $slug);

        if (isset($data['card_image_url'])) {
            $stmt->bindParam(':card_image_url', $data['card_image_url']);
        }
        if (isset($data['hero_image_url'])) {
            $stmt->bindParam(':hero_image_url', $data['hero_image_url']);
        }
        if (isset($data['intro_image_url'])) {
            $stmt->bindParam(':intro_image_url', $data['intro_image_url']);
        }

        $stmt->execute();

        // Wipe and re-insert related data
        $this->highlight->deleteByLocationSlug($slug);
        $this->visitorInfo->deleteByLocationSlug($slug);
        $this->nearbyAttractions->deleteByLocationSlug($slug);

        foreach ($data['highlights'] as $item) {
            $item['location_slug'] = $slug;
            $this->highlight->create($item);
        }

        foreach ($data['visitor_info'] as $item) {
            $item['location_slug'] = $slug;
            $this->visitorInfo->create($item);
        }

        foreach ($data['nearby_attractions'] as $item) {
            $item['location_slug'] = $slug;
            $this->nearbyAttractions->create($item);
        }

        return true;
    }

}
