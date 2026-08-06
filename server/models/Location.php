<?php
// Updated Location Model with Sub-Models Injected and Debug Logging
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
        // DEBUG: Log what we received in the model
        error_log("=== LOCATION MODEL CREATE ===");
        error_log("Received data: " . print_r($data, true));
        error_log("Highlights array type: " . gettype($data['highlights'] ?? 'NOT SET'));
        error_log("Highlights array count: " . (isset($data['highlights']) ? count($data['highlights']) : 'NOT SET'));
        error_log("Visitor_info array type: " . gettype($data['visitor_info'] ?? 'NOT SET'));
        error_log("Visitor_info array count: " . (isset($data['visitor_info']) ? count($data['visitor_info']) : 'NOT SET'));
        error_log("Nearby_attractions array type: " . gettype($data['nearby_attractions'] ?? 'NOT SET'));
        error_log("Nearby_attractions array count: " . (isset($data['nearby_attractions']) ? count($data['nearby_attractions']) : 'NOT SET'));

        // First, insert the main location record
        $stmt = $this->pdo->prepare("INSERT INTO locations (
            slug, title, subtitle, card_description, card_image_url, card_image_hint,
            distance, hero_image_url, hero_image_hint, intro_title, intro_description,
            intro_image_url, intro_image_hint, map_embed_url, category,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");

        $stmt->execute([
            $data['slug'], $data['title'], $data['subtitle'], $data['card_description'],
            $data['card_image_url'], $data['card_image_hint'] ?? '', $data['distance'],
            $data['hero_image_url'], $data['hero_image_hint'] ?? '', $data['intro_title'],
            $data['intro_description'], $data['intro_image_url'], $data['intro_image_hint'] ?? '',
            $data['map_embed_url'], $data['category']
        ]);

        error_log("Main location record inserted successfully");

        // Process highlights
        if (isset($data['highlights']) && is_array($data['highlights']) && !empty($data['highlights'])) {
            error_log("Processing highlights - count: " . count($data['highlights']));
            foreach ($data['highlights'] as $index => $item) {
                error_log("Processing highlight #$index: " . print_r($item, true));
                $item['location_slug'] = $data['slug'];
                try {
                    $result = $this->highlight->create($item);
                    error_log("Highlight #$index created successfully: " . print_r($result, true));
                } catch (Exception $e) {
                    error_log("Error creating highlight #$index: " . $e->getMessage());
                }
            }
        } else {
            error_log("No highlights to process or highlights is not a valid array");
        }

        // Process visitor_info
        if (isset($data['visitor_info']) && is_array($data['visitor_info']) && !empty($data['visitor_info'])) {
            error_log("Processing visitor_info - count: " . count($data['visitor_info']));
            foreach ($data['visitor_info'] as $index => $item) {
                error_log("Processing visitor_info #$index: " . print_r($item, true));
                $item['location_slug'] = $data['slug'];
                try {
                    $result = $this->visitorInfo->create($item);
                    error_log("Visitor_info #$index created successfully: " . print_r($result, true));
                } catch (Exception $e) {
                    error_log("Error creating visitor_info #$index: " . $e->getMessage());
                }
            }
        } else {
            error_log("No visitor_info to process or visitor_info is not a valid array");
        }

        // Process nearby_attractions
        if (isset($data['nearby_attractions']) && is_array($data['nearby_attractions']) && !empty($data['nearby_attractions'])) {
            error_log("Processing nearby_attractions - count: " . count($data['nearby_attractions']));
            foreach ($data['nearby_attractions'] as $index => $item) {
                error_log("Processing nearby_attractions #$index: " . print_r($item, true));
                $item['location_slug'] = $data['slug'];
                try {
                    $result = $this->nearbyAttractions->create($item);
                    error_log("Nearby_attractions #$index created successfully: " . print_r($result, true));
                } catch (Exception $e) {
                    error_log("Error creating nearby_attractions #$index: " . $e->getMessage());
                }
            }
        } else {
            error_log("No nearby_attractions to process or nearby_attractions is not a valid array");
        }

        error_log("=== END LOCATION MODEL CREATE ===");
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
        
        $cardImageHint = $data['card_image_hint'] ?? '';
        $stmt->bindParam(':card_image_hint', $cardImageHint);
        
        $stmt->bindParam(':distance', $data['distance']);
        
        $heroImageHint = $data['hero_image_hint'] ?? '';
        $stmt->bindParam(':hero_image_hint', $heroImageHint);
        
        $stmt->bindParam(':intro_title', $data['intro_title']);
        $stmt->bindParam(':intro_description', $data['intro_description']);
        
        $introImageHint = $data['intro_image_hint'] ?? '';
        $stmt->bindParam(':intro_image_hint', $introImageHint);

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

        if (isset($data['highlights']) && is_array($data['highlights'])) {
            foreach ($data['highlights'] as $item) {
                $item['location_slug'] = $slug;
                $this->highlight->create($item);
            }
        }

        if (isset($data['visitor_info']) && is_array($data['visitor_info'])) {
            foreach ($data['visitor_info'] as $item) {
                $item['location_slug'] = $slug;
                $this->visitorInfo->create($item);
            }
        }

        if (isset($data['nearby_attractions']) && is_array($data['nearby_attractions'])) {
            foreach ($data['nearby_attractions'] as $item) {
                $item['location_slug'] = $slug;
                $this->nearbyAttractions->create($item);
            }
        }

        return true;
    }
}
?>