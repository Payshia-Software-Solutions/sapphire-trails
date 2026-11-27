<?php

require_once __DIR__ . '/../models/SystemSchema.php';

class SystemController
{
    private $schemaModel;

    public function __construct($pdo)
    {
        $this->schemaModel = new SystemSchema($pdo);
    }

    /**
     * Admin: Check database schema status and pending updates
     * GET /system/schema-status/
     */
    public function getSchemaStatus()
    {
        try {
            $report = $this->schemaModel->getSchemaStatus();
            echo json_encode($report);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to inspect schema: ' . $e->getMessage()]);
        }
    }

    /**
     * Admin: Apply pending non-destructive schema updates (CREATE IF NOT EXISTS / ADD COLUMN)
     * POST /system/schema-update/
     */
    public function runSchemaUpdate()
    {
        try {
            $result = $this->schemaModel->runSchemaUpdates();
            if (!$result['success']) {
                http_response_code(500);
            }
            echo json_encode($result);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to run schema update: ' . $e->getMessage()]);
        }
    }
}
