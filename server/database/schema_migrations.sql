-- ============================================================================
-- Sapphire Trails - Production Idempotent Schema & Migrations Script
-- Safe to run on MySQL 5.7+, MySQL 8.0+, and MariaDB (e.g. via phpMyAdmin)
-- ============================================================================

-- 1. Referral Agents Table
CREATE TABLE IF NOT EXISTS `referral_agents` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Referral Commissions Ledger Table
CREATE TABLE IF NOT EXISTS `referral_commissions` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Mail Settings & Audit Logs Tables
CREATE TABLE IF NOT EXISTS `mail_settings` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `mail_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `recipient` VARCHAR(255) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `email_type` VARCHAR(50) NOT NULL,
    `status` ENUM('sent', 'failed') NOT NULL DEFAULT 'sent',
    `error_message` TEXT NULL,
    `body_preview` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Newsletter & Guide Subscribers Table
CREATE TABLE IF NOT EXISTS `subscribers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `source` VARCHAR(255) NOT NULL DEFAULT '2026 Gem Buyer Guide Download',
    `status` ENUM('active', 'unsubscribed') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_email` (`email`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Editorial Field Journal / Articles Table
CREATE TABLE IF NOT EXISTS `articles` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Safe Idempotent Column Additions for Existing Tables (`bookings`, `contact`)
DROP PROCEDURE IF EXISTS `sapphire_add_col_if_missing`;
DELIMITER //
CREATE PROCEDURE `sapphire_add_col_if_missing`(
    IN p_table VARCHAR(64),
    IN p_col VARCHAR(64),
    IN p_def TEXT
)
BEGIN
    IF EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = p_table
    ) AND NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = p_table
          AND COLUMN_NAME = p_col
    ) THEN
        SET @sql = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN ', p_def);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

-- Bookings referral & pricing columns
CALL `sapphire_add_col_if_missing`('bookings', 'gross_amount', '`gross_amount` DECIMAL(10,2) NULL AFTER `guests`');
CALL `sapphire_add_col_if_missing`('bookings', 'discount_amount', '`discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER `gross_amount`');
CALL `sapphire_add_col_if_missing`('bookings', 'total_price', '`total_price` DECIMAL(10,2) NULL AFTER `discount_amount`');
CALL `sapphire_add_col_if_missing`('bookings', 'referral_code_id', '`referral_code_id` INT NULL AFTER `total_price`');
CALL `sapphire_add_col_if_missing`('bookings', 'referral_code_used', '`referral_code_used` VARCHAR(50) NULL AFTER `referral_code_id`');

-- Contact inquiry metadata columns
CALL `sapphire_add_col_if_missing`('contact', 'phone', '`phone` VARCHAR(100) NULL AFTER `email`');
CALL `sapphire_add_col_if_missing`('contact', 'tour_interest', '`tour_interest` VARCHAR(255) NULL AFTER `phone`');
CALL `sapphire_add_col_if_missing`('contact', 'subject', '`subject` VARCHAR(255) NULL AFTER `tour_interest`');
CALL `sapphire_add_col_if_missing`('contact', 'status', "`status` VARCHAR(50) NOT NULL DEFAULT 'unread' AFTER `message`");

DROP PROCEDURE IF EXISTS `sapphire_add_col_if_missing`;
