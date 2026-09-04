<?php

require_once __DIR__ . '/../lib/Env.php';

class Mail
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->ensureTablesExist();
    }

    private function ensureTablesExist()
    {
        $sqlSettings = "CREATE TABLE IF NOT EXISTS `mail_settings` (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

        $sqlLogs = "CREATE TABLE IF NOT EXISTS `mail_logs` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `recipient` VARCHAR(255) NOT NULL,
            `subject` VARCHAR(255) NOT NULL,
            `email_type` VARCHAR(50) NOT NULL,
            `status` ENUM('sent', 'failed') NOT NULL DEFAULT 'sent',
            `error_message` TEXT NULL,
            `body_preview` TEXT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

        try {
            $this->pdo->exec($sqlSettings);
            $this->pdo->exec($sqlLogs);
        } catch (\Exception $e) {
            error_log("Error creating mail tables: " . $e->getMessage());
        }
    }

    public function getSettings()
    {
        $stmt = $this->pdo->query("SELECT * FROM `mail_settings` ORDER BY `id` ASC LIMIT 1");
        $settings = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$settings) {
            // Seed from environment variables
            $settings = [
                'mail_driver'      => 'smtp',
                'smtp_host'        => Env::get('MAIL_HOST', 'mail.example.com'),
                'smtp_port'        => (int)Env::get('MAIL_PORT', 465),
                'smtp_encryption'  => (int)Env::get('MAIL_PORT', 465) == 465 ? 'ssl' : 'tls',
                'smtp_username'    => Env::get('MAIL_USER', 'web-booking@example.com'),
                'smtp_password'    => Env::get('MAIL_PASS', ''),
                'from_email'       => Env::get('MAIL_FROM', 'web-booking@example.com'),
                'from_name'        => 'Sapphire Trails',
                'admin_emails'     => Env::get('ADMIN_EMAILS', Env::get('ADMIN_EMAIL', 'admin@example.com')),
                'admin_emails_cc'  => Env::get('ADMIN_EMAILS_CC', ''),
                'admin_emails_bcc' => Env::get('ADMIN_EMAILS_BCC', ''),
                'is_enabled'       => 1
            ];

            $insertStmt = $this->pdo->prepare("INSERT INTO `mail_settings` 
                (`mail_driver`, `smtp_host`, `smtp_port`, `smtp_encryption`, `smtp_username`, `smtp_password`, `from_email`, `from_name`, `admin_emails`, `admin_emails_cc`, `admin_emails_bcc`, `is_enabled`) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $insertStmt->execute([
                $settings['mail_driver'],
                $settings['smtp_host'],
                $settings['smtp_port'],
                $settings['smtp_encryption'],
                $settings['smtp_username'],
                $settings['smtp_password'],
                $settings['from_email'],
                $settings['from_name'],
                $settings['admin_emails'],
                $settings['admin_emails_cc'],
                $settings['admin_emails_bcc'],
                $settings['is_enabled']
            ]);
            $settings['id'] = (int)$this->pdo->lastInsertId();
        }

        return $settings;
    }

    public function updateSettings($data)
    {
        $current = $this->getSettings();
        $id = $current['id'];

        $mailDriver     = $data['mail_driver'] ?? $current['mail_driver'];
        $smtpHost       = trim($data['smtp_host'] ?? $current['smtp_host']);
        $smtpPort       = (int)($data['smtp_port'] ?? $current['smtp_port']);
        $smtpEncryption = $data['smtp_encryption'] ?? $current['smtp_encryption'];
        $smtpUsername   = trim($data['smtp_username'] ?? $current['smtp_username']);
        $fromEmail      = trim($data['from_email'] ?? $current['from_email']);
        $fromName       = trim($data['from_name'] ?? $current['from_name']);
        $adminEmails    = trim($data['admin_emails'] ?? $current['admin_emails']);
        $adminEmailsCc  = trim($data['admin_emails_cc'] ?? $current['admin_emails_cc']);
        $adminEmailsBcc = trim($data['admin_emails_bcc'] ?? $current['admin_emails_bcc']);
        $isEnabled      = isset($data['is_enabled']) ? (int)$data['is_enabled'] : $current['is_enabled'];

        // Only update password if a new non-empty password is provided
        $smtpPassword = $current['smtp_password'];
        if (!empty($data['smtp_password']) && trim($data['smtp_password']) !== '********') {
            $smtpPassword = trim($data['smtp_password']);
        }

        $sql = "UPDATE `mail_settings` SET 
            `mail_driver` = ?, 
            `smtp_host` = ?, 
            `smtp_port` = ?, 
            `smtp_encryption` = ?, 
            `smtp_username` = ?, 
            `smtp_password` = ?, 
            `from_email` = ?, 
            `from_name` = ?, 
            `admin_emails` = ?, 
            `admin_emails_cc` = ?, 
            `admin_emails_bcc` = ?, 
            `is_enabled` = ? 
            WHERE `id` = ?";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            $mailDriver,
            $smtpHost,
            $smtpPort,
            $smtpEncryption,
            $smtpUsername,
            $smtpPassword,
            $fromEmail,
            $fromName,
            $adminEmails,
            $adminEmailsCc,
            $adminEmailsBcc,
            $isEnabled,
            $id
        ]);

        return $this->getSettings();
    }

    public function logEmail($recipient, $subject, $emailType, $status, $errorMessage = null, $bodyPreview = null)
    {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO `mail_logs` 
                (`recipient`, `subject`, `email_type`, `status`, `error_message`, `body_preview`) 
                VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $recipient,
                $subject,
                $emailType,
                $status,
                $errorMessage,
                $bodyPreview ? substr(strip_tags($bodyPreview), 0, 500) : null
            ]);
            return (int)$this->pdo->lastInsertId();
        } catch (\Exception $e) {
            error_log("Failed to insert mail log: " . $e->getMessage());
            return null;
        }
    }

    public function getLogs($limit = 100, $offset = 0, $status = null, $emailType = null, $search = null)
    {
        $sql = "SELECT * FROM `mail_logs` WHERE 1=1";
        $params = [];

        if (!empty($status) && $status !== 'all') {
            $sql .= " AND `status` = ?";
            $params[] = $status;
        }

        if (!empty($emailType) && $emailType !== 'all') {
            $sql .= " AND `email_type` = ?";
            $params[] = $emailType;
        }

        if (!empty($search)) {
            $sql .= " AND (`recipient` LIKE ? OR `subject` LIKE ? OR `error_message` LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        $sqlCount = "SELECT COUNT(*) as total FROM (" . $sql . ") as filtered_count";
        $countStmt = $this->pdo->prepare($sqlCount);
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        $sql .= " ORDER BY `created_at` DESC LIMIT " . (int)$limit . " OFFSET " . (int)$offset;
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'total'  => $total,
            'limit'  => (int)$limit,
            'offset' => (int)$offset,
            'logs'   => $logs
        ];
    }

    public function clearLogs($olderThanDays = null)
    {
        if ($olderThanDays !== null && (int)$olderThanDays > 0) {
            $stmt = $this->pdo->prepare("DELETE FROM `mail_logs` WHERE `created_at` < DATE_SUB(NOW(), INTERVAL ? DAY)");
            $stmt->execute([(int)$olderThanDays]);
        } else {
            $stmt = $this->pdo->exec("TRUNCATE TABLE `mail_logs`");
        }
        return true;
    }
}
