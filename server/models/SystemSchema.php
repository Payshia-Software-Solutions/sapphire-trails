<?php

class SystemSchema
{
    private $pdo;
    private const SCHEMA_VERSION = '2026.11.28';

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Authoritative definition of required feature tables and extension columns.
     */
    private function getDefinitions(): array
    {
        return [
            [
                'name' => 'referral_agents',
                'label' => 'Referral Agents Registry',
                'description' => 'Stores approved/pending partners, personal referral codes, and custom commission overrides.',
                'required' => true,
                'create_sql' => "CREATE TABLE IF NOT EXISTS `referral_agents` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `user_id` INT NOT NULL UNIQUE,
                    `referral_code` VARCHAR(50) NULL UNIQUE,
                    `status` ENUM('pending', 'approved', 'rejected', 'suspended') NOT NULL DEFAULT 'pending',
                    `agent_type` VARCHAR(50) NOT NULL DEFAULT 'customer_agent',
                    `application_note` TEXT NULL,
                    `admin_note` TEXT NULL,
                    `commission_type` ENUM('percentage', 'fixed') NULL,
                    `commission_value` DECIMAL(10,2) NULL,
                    `guest_discount_type` ENUM('none', 'percentage', 'fixed') NULL,
                    `guest_discount_value` DECIMAL(10,2) NULL,
                    `discount_bear_mode` ENUM('company', 'split', 'agent') NULL,
                    `agent_discount_share_percent` DECIMAL(5,2) NULL,
                    `total_clicks` INT NOT NULL DEFAULT 0,
                    `approved_by` INT NULL,
                    `approved_at` DATETIME NULL,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX `idx_referral_status` (`status`),
                    INDEX `idx_referral_code` (`referral_code`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
                'columns' => [],
            ],
            [
                'name' => 'referral_commissions',
                'label' => 'Referral Commission Ledger',
                'description' => 'Tracks booking referral attribution, guest discount splits, and payout settlement status.',
                'required' => true,
                'create_sql' => "CREATE TABLE IF NOT EXISTS `referral_commissions` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `agent_id` INT NOT NULL,
                    `user_id` INT NOT NULL,
                    `booking_id` INT NOT NULL UNIQUE,
                    `referral_code` VARCHAR(50) NOT NULL,
                    `gross_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                    `guest_discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                    `net_booking_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                    `company_discount_share` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                    `agent_discount_share` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                    `gross_commission_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                    `net_commission_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                    `commission_type` VARCHAR(20) NOT NULL DEFAULT 'percentage',
                    `commission_rate` DECIMAL(10,2) NOT NULL DEFAULT 10.00,
                    `guest_discount_type` VARCHAR(20) NOT NULL DEFAULT 'percentage',
                    `guest_discount_rate` DECIMAL(10,2) NOT NULL DEFAULT 5.00,
                    `discount_bear_mode` VARCHAR(20) NOT NULL DEFAULT 'split',
                    `agent_discount_share_percent` DECIMAL(5,2) NOT NULL DEFAULT 50.00,
                    `status` ENUM('pending', 'approved', 'paid', 'cancelled') NOT NULL DEFAULT 'pending',
                    `payout_reference` VARCHAR(255) NULL,
                    `payout_notes` TEXT NULL,
                    `paid_at` DATETIME NULL,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX `idx_comm_agent` (`agent_id`),
                    INDEX `idx_comm_status` (`status`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
                'columns' => [],
            ],
            [
                'name' => 'bookings',
                'label' => 'Bookings Pricing & Referral Columns',
                'description' => 'Extension columns on bookings for gross pricing, referral discounts, and attribution.',
                'required' => false,
                'create_sql' => null,
                'columns' => [
                    'gross_amount' => "ALTER TABLE `bookings` ADD COLUMN `gross_amount` DECIMAL(10,2) NULL AFTER `guests`",
                    'discount_amount' => "ALTER TABLE `bookings` ADD COLUMN `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER `gross_amount`",
                    'total_price' => "ALTER TABLE `bookings` ADD COLUMN `total_price` DECIMAL(10,2) NULL AFTER `discount_amount`",
                    'referral_code_id' => "ALTER TABLE `bookings` ADD COLUMN `referral_code_id` INT NULL AFTER `total_price`",
                    'referral_code_used' => "ALTER TABLE `bookings` ADD COLUMN `referral_code_used` VARCHAR(50) NULL AFTER `referral_code_id`",
                ],
            ],
            [
                'name' => 'mail_settings',
                'label' => 'SMTP & Mail Configuration',
                'description' => 'Stores SMTP credentials, sender identity, and administrator recipient lists.',
                'required' => true,
                'create_sql' => "CREATE TABLE IF NOT EXISTS `mail_settings` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `mail_driver` VARCHAR(20) DEFAULT 'smtp',
                    `smtp_host` VARCHAR(255) DEFAULT '',
                    `smtp_port` INT DEFAULT 465,
                    `smtp_encryption` VARCHAR(10) DEFAULT 'ssl',
                    `smtp_username` VARCHAR(255) DEFAULT '',
                    `smtp_password` VARCHAR(255) DEFAULT '',
                    `from_email` VARCHAR(255) DEFAULT '',
                    `from_name` VARCHAR(255) DEFAULT 'Sapphire Trails',
                    `admin_emails` TEXT NULL,
                    `admin_emails_cc` TEXT NULL,
                    `admin_emails_bcc` TEXT NULL,
                    `is_enabled` TINYINT(1) DEFAULT 1,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
                'columns' => [],
            ],
            [
                'name' => 'mail_logs',
                'label' => 'Outbound Email Dispatch Logs',
                'description' => 'Audit log of transactional booking, invoice, contact, and referral partner emails.',
                'required' => true,
                'create_sql' => "CREATE TABLE IF NOT EXISTS `mail_logs` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `recipient` VARCHAR(255) NOT NULL,
                    `subject` VARCHAR(255) NOT NULL,
                    `email_type` VARCHAR(50) NOT NULL,
                    `status` ENUM('sent', 'failed') NOT NULL DEFAULT 'sent',
                    `error_message` TEXT NULL,
                    `body_preview` TEXT NULL,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
                'columns' => [],
            ],
            [
                'name' => 'contact',
                'label' => 'Contact Inquiry Columns',
                'description' => 'Metadata fields on contact submissions for phone, tour interest, subject, and reply workflow.',
                'required' => false,
                'create_sql' => null,
                'columns' => [
                    'phone' => "ALTER TABLE `contact` ADD COLUMN `phone` VARCHAR(100) NULL AFTER `email`",
                    'tour_interest' => "ALTER TABLE `contact` ADD COLUMN `tour_interest` VARCHAR(255) NULL AFTER `phone`",
                    'subject' => "ALTER TABLE `contact` ADD COLUMN `subject` VARCHAR(255) NULL AFTER `tour_interest`",
                    'status' => "ALTER TABLE `contact` ADD COLUMN `status` VARCHAR(50) NOT NULL DEFAULT 'unread' AFTER `message`",
                ],
            ],
            [
                'name' => 'subscribers',
                'label' => 'Newsletter & Guide Subscribers',
                'description' => 'Stores opt-in leads from website subscription & 2026 Gem Buyer Guide forms.',
                'required' => true,
                'create_sql' => "CREATE TABLE IF NOT EXISTS `subscribers` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `email` VARCHAR(255) NOT NULL UNIQUE,
                    `source` VARCHAR(255) NOT NULL DEFAULT '2026 Gem Buyer Guide Download',
                    `status` ENUM('active', 'unsubscribed') NOT NULL DEFAULT 'active',
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX `idx_email` (`email`),
                    INDEX `idx_status` (`status`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",
                'columns' => [],
            ],
            [
                'name' => 'articles',
                'label' => 'Editorial Articles & Gem Guides',
                'description' => 'Stores long-form gemology articles, author details, and structured takeaways.',
                'required' => true,
                'create_sql' => "CREATE TABLE IF NOT EXISTS `articles` (
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
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
                'columns' => [],
            ],
        ];
    }

    /**
     * Inspect live MySQL INFORMATION_SCHEMA without modifying anything.
     */
    public function getSchemaStatus(): array
    {
        $dbName = (string)$this->pdo->query("SELECT DATABASE()")->fetchColumn();
        $mysqlVersion = (string)$this->pdo->query("SELECT VERSION()")->fetchColumn();

        // Fetch existing table stats in one query
        $tableStmt = $this->pdo->prepare("
            SELECT TABLE_NAME, TABLE_ROWS
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = ?
        ");
        $tableStmt->execute([$dbName]);
        $existingTables = [];
        foreach ($tableStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $existingTables[strtolower((string)$row['TABLE_NAME'])] = (int)($row['TABLE_ROWS'] ?? 0);
        }

        // Fetch existing column names in one query
        $colStmt = $this->pdo->prepare("
            SELECT TABLE_NAME, COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ?
        ");
        $colStmt->execute([$dbName]);
        $existingColumns = [];
        foreach ($colStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $t = strtolower((string)$row['TABLE_NAME']);
            $c = strtolower((string)$row['COLUMN_NAME']);
            $existingColumns[$t][$c] = true;
        }

        $items = [];
        $missingCount = 0;

        foreach ($this->getDefinitions() as $def) {
            $tableName = strtolower($def['name']);
            $tableExists = array_key_exists($tableName, $existingTables);
            $missingCols = [];
            $checkedCols = array_keys($def['columns']);

            if ($tableExists) {
                foreach ($def['columns'] as $colName => $alterSql) {
                    if (!isset($existingColumns[$tableName][strtolower($colName)])) {
                        $missingCols[] = $colName;
                    }
                }
            } elseif (!empty($def['required'])) {
                $missingCount++;
            }

            $missingCount += count($missingCols);

            if (!$tableExists) {
                $status = $def['required'] ? 'missing_table' : 'base_table_missing';
            } elseif (!empty($missingCols)) {
                $status = 'missing_columns';
            } else {
                $status = 'ok';
            }

            $items[] = [
                'name' => $def['name'],
                'label' => $def['label'],
                'description' => $def['description'],
                'exists' => $tableExists,
                'row_count' => $tableExists ? $existingTables[$tableName] : 0,
                'checked_columns' => $checkedCols,
                'missing_columns' => $missingCols,
                'status' => $status,
            ];
        }

        $sqlPath = __DIR__ . '/../database/schema_migrations.sql';
        $sqlScript = file_exists($sqlPath) ? file_get_contents($sqlPath) : '';

        return [
            'schema_version' => self::SCHEMA_VERSION,
            'database_name' => $dbName,
            'mysql_version' => $mysqlVersion,
            'checked_at' => date('c'),
            'up_to_date' => $missingCount === 0,
            'missing_count' => $missingCount,
            'tables' => $items,
            'sql_script' => $sqlScript,
        ];
    }

    /**
     * Apply only missing tables and columns safely.
     */
    public function runSchemaUpdates(): array
    {
        $statusBefore = $this->getSchemaStatus();
        $applied = [];
        $errors = [];

        $byName = [];
        foreach ($statusBefore['tables'] as $row) {
            $byName[$row['name']] = $row;
        }

        foreach ($this->getDefinitions() as $def) {
            $name = $def['name'];
            $live = $byName[$name] ?? null;
            if (!$live) {
                continue;
            }

            // Create missing tables
            if (!$live['exists'] && !empty($def['create_sql'])) {
                try {
                    $this->pdo->exec($def['create_sql']);
                    $applied[] = "Created table `{$name}`";
                } catch (\Throwable $e) {
                    $errors[] = "Failed creating table `{$name}`: " . $e->getMessage();
                }
            }

            // Add missing columns on existing tables
            if ($live['exists'] && !empty($live['missing_columns'])) {
                foreach ($live['missing_columns'] as $colName) {
                    if (!empty($def['columns'][$colName])) {
                        try {
                            $this->pdo->exec($def['columns'][$colName]);
                            $applied[] = "Added column `{$name}`.`{$colName}`";
                        } catch (\Throwable $e) {
                            $errors[] = "Failed adding `{$name}`.`{$colName}`: " . $e->getMessage();
                        }
                    }
                }
            }
        }

        $statusAfter = $this->getSchemaStatus();

        return [
            'success' => empty($errors),
            'applied' => $applied,
            'errors' => $errors,
            'status' => $statusAfter,
        ];
    }
}
