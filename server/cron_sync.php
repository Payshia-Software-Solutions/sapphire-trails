<?php
// cron_sync.php - CLI / Cron Job to auto sync all OTA iCal feeds
// Run via CLI: php cron_sync.php
// Or via Cron Job: */15 * * * * php /path/to/server/cron_sync.php > /dev/null 2>&1

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/lib/ICalSyncService.php';

try {
    $syncService = new ICalSyncService($pdo);
    $result = $syncService->syncAllFeeds();
    
    $timestamp = date('Y-m-d H:i:s');
    echo "[{$timestamp}] iCal Auto Sync Finished.\n";
    echo "Total Feeds: {$result['total_feeds']}, Created: {$result['created']}, Updated: {$result['updated']}\n";
    if (!empty($result['errors'])) {
        echo "Errors encountered: " . implode(", ", $result['errors']) . "\n";
    }
} catch (Exception $e) {
    echo "[" . date('Y-m-d H:i:s') . "] Auto Sync Error: " . $e->getMessage() . "\n";
}
