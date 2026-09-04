<?php
require_once './models/PackageICalFeed.php';
require_once './lib/ICalSyncService.php';

class ICalController
{
    private $feedModel;
    private $syncService;

    public function __construct($pdo)
    {
        $this->feedModel = new PackageICalFeed($pdo);
        $this->syncService = new ICalSyncService($pdo);
    }

    /**
     * Public endpoint to export iCal feed for a package
     */
    public function export($tourPackageId)
    {
        try {
            $icsData = $this->syncService->generateExportIcs($tourPackageId);
            header('Content-Type: text/calendar; charset=utf-8');
            header('Content-Disposition: inline; filename="package_' . $tourPackageId . '.ics"');
            header('Cache-Control: no-cache, no-store, must-revalidate');
            header('Pragma: no-cache');
            header('Expires: 0');
            echo $icsData;
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Failed to generate calendar: ' . $e->getMessage()]);
            exit;
        }
    }

    /**
     * Get all feeds or feeds for a package
     */
    public function getFeeds($tourPackageId = null)
    {
        if ($tourPackageId) {
            $feeds = $this->feedModel->getByPackageId($tourPackageId);
        } else {
            $feeds = $this->feedModel->getAll();
        }
        echo json_encode($feeds);
    }

    /**
     * Add a new OTA iCal feed URL
     */
    public function createFeed()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || empty($data['tour_package_id']) || empty($data['feed_url'])) {
            http_response_code(400);
            echo json_encode(['error' => 'tour_package_id and feed_url are required.']);
            return;
        }

        try {
            $id = $this->feedModel->create($data);
            $newFeed = $this->feedModel->getById($id);
            http_response_code(201);
            echo json_encode($newFeed);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save feed: ' . $e->getMessage()]);
        }
    }

    /**
     * Delete an OTA iCal feed
     */
    public function deleteFeed($id)
    {
        try {
            $this->feedModel->delete($id);
            echo json_encode(['message' => 'Feed deleted successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete feed: ' . $e->getMessage()]);
        }
    }

    /**
     * Trigger sync for a specific feed
     */
    public function syncFeed($id)
    {
        try {
            $stats = $this->syncService->syncFeed($id);
            echo json_encode([
                'message' => 'Feed synced successfully.',
                'stats' => $stats
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * Trigger sync for all feeds or package feeds
     */
    public function syncAll($tourPackageId = null)
    {
        try {
            $stats = $this->syncService->syncAllFeeds($tourPackageId);
            echo json_encode([
                'message' => 'Sync completed.',
                'stats' => $stats
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
