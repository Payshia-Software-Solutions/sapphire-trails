<?php
require_once __DIR__ . '/../models/SiteContent.php';

class AnalyticsController
{
    private $pdo;
    private $siteContentModel;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->siteContentModel = new SiteContent($pdo);
    }

    private function getDefaultSettings()
    {
        return [
            'google_analytics_id'    => 'G-TX702Y4CLS',
            'meta_pixel_id'          => '',
            'gtm_id'                 => '',
            'is_ga_enabled'          => true,
            'is_pixel_enabled'       => false,
            'exclude_admin_traffic'  => true,
            'enable_ecommerce_events'=> true,
        ];
    }

    /**
     * Get public config (Only active IDs for frontend script injection)
     */
    public function getPublicConfig()
    {
        $saved = $this->siteContentModel->get('analytics_settings');
        $settings = array_merge($this->getDefaultSettings(), is_array($saved) ? $saved : []);

        $config = [
            'google_analytics_id'   => !empty($settings['is_ga_enabled']) ? ($settings['google_analytics_id'] ?? '') : '',
            'meta_pixel_id'         => !empty($settings['is_pixel_enabled']) ? ($settings['meta_pixel_id'] ?? '') : '',
            'gtm_id'                => $settings['gtm_id'] ?? '',
            'is_ga_enabled'         => (bool)($settings['is_ga_enabled'] ?? false),
            'is_pixel_enabled'      => (bool)($settings['is_pixel_enabled'] ?? false),
            'exclude_admin_traffic' => (bool)($settings['exclude_admin_traffic'] ?? true),
            'enable_ecommerce_events' => (bool)($settings['enable_ecommerce_events'] ?? true),
        ];

        echo json_encode($config);
    }

    /**
     * Get full admin settings
     */
    public function getSettings()
    {
        $saved = $this->siteContentModel->get('analytics_settings');
        $settings = array_merge($this->getDefaultSettings(), is_array($saved) ? $saved : []);
        echo json_encode($settings);
    }

    /**
     * Save admin settings
     */
    public function updateSettings()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON']);
            return;
        }

        try {
            $current = $this->siteContentModel->get('analytics_settings');
            $merged = array_merge($this->getDefaultSettings(), is_array($current) ? $current : [], $data);
            
            // Clean/Sanitize IDs
            $merged['google_analytics_id'] = trim($merged['google_analytics_id'] ?? '');
            $merged['meta_pixel_id']       = preg_replace('/[^0-9]/', '', trim($merged['meta_pixel_id'] ?? ''));
            $merged['gtm_id']              = trim($merged['gtm_id'] ?? '');
            $merged['is_ga_enabled']       = (bool)($merged['is_ga_enabled'] ?? false);
            $merged['is_pixel_enabled']    = (bool)($merged['is_pixel_enabled'] ?? false);
            $merged['exclude_admin_traffic'] = (bool)($merged['exclude_admin_traffic'] ?? true);
            $merged['enable_ecommerce_events'] = (bool)($merged['enable_ecommerce_events'] ?? true);

            $this->siteContentModel->update('analytics_settings', $merged);
            
            echo json_encode([
                'success' => true,
                'message' => 'Analytics and Pixel configuration saved successfully.',
                'settings' => $merged
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save analytics settings: ' . $e->getMessage()]);
        }
    }
}
