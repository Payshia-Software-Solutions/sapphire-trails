<?php
class SiteContent
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function get($section_key)
    {
        $stmt = $this->pdo->prepare("SELECT content FROM site_content WHERE section_key = ?");
        $stmt->execute([$section_key]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result && isset($result['content'])) {
            return json_decode($result['content'], true);
        }
        return null; // Return null if not found
    }
    
    public function update($section_key, $content)
    {
        // Check if the section key already exists
        $stmt_check = $this->pdo->prepare("SELECT COUNT(*) FROM site_content WHERE section_key = ?");
        $stmt_check->execute([$section_key]);
        $exists = $stmt_check->fetchColumn() > 0;
        
        $json_content = json_encode($content);

        if ($exists) {
            // Update existing record
            $stmt = $this->pdo->prepare("UPDATE site_content SET content = ? WHERE section_key = ?");
            return $stmt->execute([$json_content, $section_key]);
        } else {
            // Insert new record
            $stmt = $this->pdo->prepare("INSERT INTO site_content (section_key, content) VALUES (?, ?)");
            return $stmt->execute([$section_key, $json_content]);
        }
    }
}
?>