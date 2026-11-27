<?php

class Referral
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Global default referral program configuration
     */
    public function getDefaultSettings(): array
    {
        return [
            'program_enabled' => true,
            'commission_type' => 'percentage',
            'commission_value' => 10.0,
            'commission_basis' => 'gross',
            'guest_discount_type' => 'percentage',
            'guest_discount_value' => 5.0,
            'discount_bear_mode' => 'split',
            'agent_discount_share_percent' => 50.0,
            'min_booking_amount' => 0.0,
            'attribution_days' => 30,
            'require_admin_approval' => true,
            'auto_approve_on_booking_confirm' => true,
        ];
    }

    /**
     * Load global referral settings from site_content
     */
    public function getSettings(): array
    {
        $defaults = $this->getDefaultSettings();
        $stmt = $this->pdo->prepare("SELECT content FROM site_content WHERE section_key = 'referral_settings'");
        $stmt->execute();
        $raw = $stmt->fetchColumn();
        if ($raw) {
            $parsed = json_decode($raw, true);
            if (is_array($parsed)) {
                return array_merge($defaults, $parsed);
            }
        }
        return $defaults;
    }

    /**
     * Save global referral settings to site_content
     */
    public function saveSettings(array $data): array
    {
        $current = $this->getSettings();
        $merged = array_merge($current, [
            'program_enabled' => isset($data['program_enabled']) ? (bool)$data['program_enabled'] : $current['program_enabled'],
            'commission_type' => in_array($data['commission_type'] ?? '', ['percentage', 'fixed'], true) ? $data['commission_type'] : $current['commission_type'],
            'commission_value' => max(0.0, floatval($data['commission_value'] ?? $current['commission_value'])),
            'commission_basis' => in_array($data['commission_basis'] ?? '', ['gross', 'net'], true) ? $data['commission_basis'] : $current['commission_basis'],
            'guest_discount_type' => in_array($data['guest_discount_type'] ?? '', ['none', 'percentage', 'fixed'], true) ? $data['guest_discount_type'] : $current['guest_discount_type'],
            'guest_discount_value' => max(0.0, floatval($data['guest_discount_value'] ?? $current['guest_discount_value'])),
            'discount_bear_mode' => in_array($data['discount_bear_mode'] ?? '', ['company', 'split', 'agent'], true) ? $data['discount_bear_mode'] : $current['discount_bear_mode'],
            'agent_discount_share_percent' => min(100.0, max(0.0, floatval($data['agent_discount_share_percent'] ?? $current['agent_discount_share_percent']))),
            'min_booking_amount' => max(0.0, floatval($data['min_booking_amount'] ?? $current['min_booking_amount'])),
            'attribution_days' => max(1, intval($data['attribution_days'] ?? $current['attribution_days'])),
            'require_admin_approval' => true,
            'auto_approve_on_booking_confirm' => isset($data['auto_approve_on_booking_confirm']) ? (bool)$data['auto_approve_on_booking_confirm'] : $current['auto_approve_on_booking_confirm'],
        ]);

        if ($merged['commission_type'] === 'percentage') {
            $merged['commission_value'] = min(100.0, $merged['commission_value']);
        }
        if ($merged['guest_discount_type'] === 'percentage') {
            $merged['guest_discount_value'] = min(100.0, $merged['guest_discount_value']);
        }
        if ($merged['discount_bear_mode'] === 'company') {
            $merged['agent_discount_share_percent'] = 0.0;
        } elseif ($merged['discount_bear_mode'] === 'agent') {
            $merged['agent_discount_share_percent'] = 100.0;
        }

        $stmtCheck = $this->pdo->prepare("SELECT COUNT(*) FROM site_content WHERE section_key = 'referral_settings'");
        $stmtCheck->execute();
        $exists = $stmtCheck->fetchColumn() > 0;
        $json = json_encode($merged);

        if ($exists) {
            $stmt = $this->pdo->prepare("UPDATE site_content SET content = ? WHERE section_key = 'referral_settings'");
            $stmt->execute([$json]);
        } else {
            $stmt = $this->pdo->prepare("INSERT INTO site_content (section_key, content) VALUES ('referral_settings', ?)");
            $stmt->execute([$json]);
        }

        return $merged;
    }

    /**
     * Resolve effective rules for an agent (per-agent override -> global settings fallback)
     */
    public function resolveEffectiveRules(?array $agent = null): array
    {
        $global = $this->getSettings();
        if (!$agent) {
            return $global;
        }

        $bearMode = $agent['discount_bear_mode'] ?? $global['discount_bear_mode'];
        $agentSharePercent = $agent['agent_discount_share_percent'] !== null
            ? floatval($agent['agent_discount_share_percent'])
            : floatval($global['agent_discount_share_percent']);

        if ($bearMode === 'company') {
            $agentSharePercent = 0.0;
        } elseif ($bearMode === 'agent') {
            $agentSharePercent = 100.0;
        }

        return [
            'program_enabled' => (bool)$global['program_enabled'],
            'commission_type' => $agent['commission_type'] ?: $global['commission_type'],
            'commission_value' => $agent['commission_value'] !== null ? floatval($agent['commission_value']) : floatval($global['commission_value']),
            'commission_basis' => $global['commission_basis'] ?? 'gross',
            'guest_discount_type' => $agent['guest_discount_type'] ?: $global['guest_discount_type'],
            'guest_discount_value' => $agent['guest_discount_value'] !== null ? floatval($agent['guest_discount_value']) : floatval($global['guest_discount_value']),
            'discount_bear_mode' => $bearMode,
            'agent_discount_share_percent' => min(100.0, max(0.0, $agentSharePercent)),
            'min_booking_amount' => floatval($global['min_booking_amount'] ?? 0),
            'attribution_days' => intval($global['attribution_days'] ?? 30),
            'auto_approve_on_booking_confirm' => (bool)($global['auto_approve_on_booking_confirm'] ?? true),
        ];
    }

    /**
     * Calculate exact guest discount, company/agent discount split, and net agent commission
     * Example: gross=10000, commission=10% (1000), guest_discount=5% (500), split=50%:
     *   guest_discount=500, net_booking=9500, company_share=250, agent_share=250, net_commission=750
     */
    public function calculateBreakdown(float $grossAmount, ?array $agent = null): array
    {
        $rules = $this->resolveEffectiveRules($agent);
        $gross = max(0.0, round($grossAmount, 2));
        $minAmount = floatval($rules['min_booking_amount'] ?? 0);

        if ($gross <= 0 || ($minAmount > 0 && $gross < $minAmount)) {
            return [
                'eligible' => $gross > 0 && $gross >= $minAmount,
                'gross_amount' => $gross,
                'guest_discount_amount' => 0.00,
                'net_booking_amount' => $gross,
                'company_discount_share' => 0.00,
                'agent_discount_share' => 0.00,
                'gross_commission_amount' => 0.00,
                'net_commission_amount' => 0.00,
                'rules' => $rules,
            ];
        }

        // 1. Guest Discount
        $guestDiscount = 0.0;
        if ($rules['guest_discount_type'] === 'percentage') {
            $guestDiscount = round($gross * (floatval($rules['guest_discount_value']) / 100.0), 2);
        } elseif ($rules['guest_discount_type'] === 'fixed') {
            $guestDiscount = round(floatval($rules['guest_discount_value']), 2);
        }
        $guestDiscount = min($gross, max(0.0, $guestDiscount));
        $netBooking = max(0.0, round($gross - $guestDiscount, 2));

        // 2. Gross Agent Commission (on gross or net depending on setting; default gross)
        $commissionBase = ($rules['commission_basis'] === 'net') ? $netBooking : $gross;
        $grossCommission = 0.0;
        if ($rules['commission_type'] === 'percentage') {
            $grossCommission = round($commissionBase * (floatval($rules['commission_value']) / 100.0), 2);
        } elseif ($rules['commission_type'] === 'fixed') {
            $grossCommission = round(floatval($rules['commission_value']), 2);
        }
        $grossCommission = max(0.0, $grossCommission);

        // 3. Discount Cost Sharing (Company vs Agent)
        $agentSharePct = floatval($rules['agent_discount_share_percent']);
        $agentDiscountShare = round($guestDiscount * ($agentSharePct / 100.0), 2);
        $companyDiscountShare = round($guestDiscount - $agentDiscountShare, 2);

        // 4. Net Agent Commission after deducting agent's share of guest discount
        $netCommission = max(0.0, round($grossCommission - $agentDiscountShare, 2));

        return [
            'eligible' => true,
            'gross_amount' => $gross,
            'guest_discount_amount' => $guestDiscount,
            'net_booking_amount' => $netBooking,
            'company_discount_share' => $companyDiscountShare,
            'agent_discount_share' => $agentDiscountShare,
            'gross_commission_amount' => $grossCommission,
            'net_commission_amount' => $netCommission,
            'rules' => $rules,
        ];
    }

    /**
     * Generate a short, memorable unique referral code (e.g. THILINA or THILIN24)
     */
    public function generateUniqueCode(string $name, ?string $preferred = null): string
    {
        if ($preferred) {
            $candidate = strtoupper(preg_replace('/[^a-zA-Z0-9\-_]/', '', trim($preferred)));
            if (strlen($candidate) >= 3 && !$this->getAgentByCode($candidate)) {
                return substr($candidate, 0, 24);
            }
        }

        // Use clean first name first (e.g. "Thilina Perera" -> "THILINA")
        $firstWord = preg_split('/\s+/', trim($name))[0] ?? $name;
        $clean = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $firstWord));
        $clean = substr($clean, 0, 8);
        if (strlen($clean) < 3) {
            $clean = 'GEM';
        }

        if (strlen($clean) >= 4 && !$this->getAgentByCode($clean)) {
            return $clean;
        }

        // Fallback: short prefix + 2 digits (e.g. THILI24)
        $prefix = substr($clean, 0, 5);
        for ($i = 0; $i < 20; $i++) {
            $suffix = (string)random_int(10, 99);
            $code = $prefix . $suffix;
            if (!$this->getAgentByCode($code)) {
                return $code;
            }
        }

        return substr($clean, 0, 4) . random_int(100, 999);
    }

    public function getAgentById($id)
    {
        $stmt = $this->pdo->prepare("
            SELECT ra.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone, u.type AS user_type
            FROM referral_agents ra
            INNER JOIN users u ON ra.user_id = u.id
            WHERE ra.id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getAgentByUserId($userId)
    {
        $stmt = $this->pdo->prepare("
            SELECT ra.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone, u.type AS user_type
            FROM referral_agents ra
            INNER JOIN users u ON ra.user_id = u.id
            WHERE ra.user_id = ?
        ");
        $stmt->execute([$userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getAgentByCode(string $code)
    {
        $stmt = $this->pdo->prepare("
            SELECT ra.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
            FROM referral_agents ra
            INNER JOIN users u ON ra.user_id = u.id
            WHERE UPPER(ra.referral_code) = UPPER(?)
        ");
        $stmt->execute([trim($code)]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getApprovedAgentByCode(string $code)
    {
        $stmt = $this->pdo->prepare("
            SELECT ra.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
            FROM referral_agents ra
            INNER JOIN users u ON ra.user_id = u.id
            WHERE UPPER(ra.referral_code) = UPPER(?) AND ra.status = 'approved'
        ");
        $stmt->execute([trim($code)]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function applyForAgent(int $userId, array $data)
    {
        $existing = $this->getAgentByUserId($userId);
        $agentType = trim((string)($data['agent_type'] ?? 'customer_agent'));
        $note = trim((string)($data['application_note'] ?? ''));

        if ($existing) {
            if ($existing['status'] === 'rejected') {
                $stmt = $this->pdo->prepare("
                    UPDATE referral_agents
                    SET status = 'pending', agent_type = ?, application_note = ?, updated_at = NOW()
                    WHERE id = ?
                ");
                $stmt->execute([$agentType, $note, $existing['id']]);
                return $this->getAgentById($existing['id']);
            }
            return $existing;
        }

        $stmt = $this->pdo->prepare("
            INSERT INTO referral_agents (user_id, status, agent_type, application_note)
            VALUES (?, 'pending', ?, ?)
        ");
        $stmt->execute([$userId, $agentType, $note]);
        return $this->getAgentById($this->pdo->lastInsertId());
    }

    public function createOrApproveAgentForUser(int $userId, array $data, ?int $adminId = null)
    {
        $userStmt = $this->pdo->prepare("SELECT id, name, email FROM users WHERE id = ?");
        $userStmt->execute([$userId]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            throw new Exception('Registered user not found');
        }

        $existing = $this->getAgentByUserId($userId);
        $preferredCode = !empty($data['referral_code']) ? trim((string)$data['referral_code']) : null;

        if ($existing) {
            $code = $existing['referral_code'];
            if ($preferredCode && strcasecmp($preferredCode, (string)$code) !== 0) {
                $codeOwner = $this->getAgentByCode($preferredCode);
                if ($codeOwner && (int)$codeOwner['id'] !== (int)$existing['id']) {
                    throw new Exception('This referral code is already assigned to another agent');
                }
                $code = strtoupper(preg_replace('/[^a-zA-Z0-9\-_]/', '', $preferredCode));
            }
            if (empty($code)) {
                $code = $this->generateUniqueCode($user['name'], $preferredCode);
            }

            return $this->updateAgent($existing['id'], array_merge($data, [
                'referral_code' => $code,
                'status' => $data['status'] ?? 'approved',
                'approved_by' => $adminId,
            ]));
        }

        $code = $this->generateUniqueCode($user['name'], $preferredCode);
        $overrides = $this->extractOverrides($data);

        $stmt = $this->pdo->prepare("
            INSERT INTO referral_agents (
                user_id, referral_code, status, agent_type, admin_note,
                commission_type, commission_value, guest_discount_type, guest_discount_value,
                discount_bear_mode, agent_discount_share_percent, approved_by, approved_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $userId,
            $code,
            $data['status'] ?? 'approved',
            $data['agent_type'] ?? 'customer_agent',
            $data['admin_note'] ?? null,
            $overrides['commission_type'],
            $overrides['commission_value'],
            $overrides['guest_discount_type'],
            $overrides['guest_discount_value'],
            $overrides['discount_bear_mode'],
            $overrides['agent_discount_share_percent'],
            $adminId,
        ]);

        return $this->getAgentById($this->pdo->lastInsertId());
    }

    public function updateAgent(int $agentId, array $data)
    {
        $existing = $this->getAgentById($agentId);
        if (!$existing) {
            return null;
        }

        $status = $data['status'] ?? $existing['status'];
        if (!in_array($status, ['pending', 'approved', 'rejected', 'suspended'], true)) {
            throw new Exception('Invalid agent status');
        }

        $code = $existing['referral_code'];
        if (!empty($data['referral_code'])) {
            $cleanCode = strtoupper(preg_replace('/[^a-zA-Z0-9\-_]/', '', trim((string)$data['referral_code'])));
            if (strlen($cleanCode) < 3) {
                throw new Exception('Referral code must be at least 3 alphanumeric characters');
            }
            $owner = $this->getAgentByCode($cleanCode);
            if ($owner && (int)$owner['id'] !== $agentId) {
                throw new Exception('Referral code is already in use');
            }
            $code = $cleanCode;
        } elseif ($status === 'approved' && empty($code)) {
            $code = $this->generateUniqueCode($existing['user_name'] ?? 'AGENT');
        }

        $overrides = $this->extractOverrides($data, $existing);

        $approvedAt = $existing['approved_at'];
        $approvedBy = $existing['approved_by'];
        if ($status === 'approved' && empty($approvedAt)) {
            $approvedAt = date('Y-m-d H:i:s');
            $approvedBy = $data['approved_by'] ?? $approvedBy;
        }

        $stmt = $this->pdo->prepare("
            UPDATE referral_agents
            SET referral_code = ?,
                status = ?,
                agent_type = ?,
                admin_note = ?,
                commission_type = ?,
                commission_value = ?,
                guest_discount_type = ?,
                guest_discount_value = ?,
                discount_bear_mode = ?,
                agent_discount_share_percent = ?,
                approved_by = ?,
                approved_at = ?,
                updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([
            $code,
            $status,
            $data['agent_type'] ?? $existing['agent_type'],
            array_key_exists('admin_note', $data) ? $data['admin_note'] : $existing['admin_note'],
            $overrides['commission_type'],
            $overrides['commission_value'],
            $overrides['guest_discount_type'],
            $overrides['guest_discount_value'],
            $overrides['discount_bear_mode'],
            $overrides['agent_discount_share_percent'],
            $approvedBy,
            $approvedAt,
            $agentId,
        ]);

        return $this->getAgentById($agentId);
    }

    private function extractOverrides(array $data, ?array $existing = null): array
    {
        $useCustom = !empty($data['use_custom_rates']);
        if (array_key_exists('use_custom_rates', $data) && !$useCustom) {
            return [
                'commission_type' => null,
                'commission_value' => null,
                'guest_discount_type' => null,
                'guest_discount_value' => null,
                'discount_bear_mode' => null,
                'agent_discount_share_percent' => null,
            ];
        }

        $commType = array_key_exists('commission_type', $data) ? ($data['commission_type'] ?: null) : ($existing['commission_type'] ?? null);
        $commVal = array_key_exists('commission_value', $data)
            ? ($data['commission_value'] === '' || $data['commission_value'] === null ? null : max(0.0, floatval($data['commission_value'])))
            : ($existing['commission_value'] ?? null);

        $discType = array_key_exists('guest_discount_type', $data) ? ($data['guest_discount_type'] ?: null) : ($existing['guest_discount_type'] ?? null);
        $discVal = array_key_exists('guest_discount_value', $data)
            ? ($data['guest_discount_value'] === '' || $data['guest_discount_value'] === null ? null : max(0.0, floatval($data['guest_discount_value'])))
            : ($existing['guest_discount_value'] ?? null);

        $bearMode = array_key_exists('discount_bear_mode', $data) ? ($data['discount_bear_mode'] ?: null) : ($existing['discount_bear_mode'] ?? null);
        $sharePct = array_key_exists('agent_discount_share_percent', $data)
            ? ($data['agent_discount_share_percent'] === '' || $data['agent_discount_share_percent'] === null ? null : min(100.0, max(0.0, floatval($data['agent_discount_share_percent']))))
            : ($existing['agent_discount_share_percent'] ?? null);

        if ($bearMode === 'company') {
            $sharePct = 0.0;
        } elseif ($bearMode === 'agent') {
            $sharePct = 100.0;
        }

        return [
            'commission_type' => $commType,
            'commission_value' => $commVal,
            'guest_discount_type' => $discType,
            'guest_discount_value' => $discVal,
            'discount_bear_mode' => $bearMode,
            'agent_discount_share_percent' => $sharePct,
        ];
    }

    public function getAllAgents(): array
    {
        $stmt = $this->pdo->query("
            SELECT ra.*,
                   u.name AS user_name,
                   u.email AS user_email,
                   u.phone AS user_phone,
                   u.type AS user_type,
                   COALESCE(COUNT(rc.id), 0) AS total_referrals,
                   COALESCE(SUM(CASE WHEN rc.status IN ('pending','approved','paid') THEN rc.net_booking_amount ELSE 0 END), 0) AS total_sales_generated,
                   COALESCE(SUM(CASE WHEN rc.status = 'pending' THEN rc.net_commission_amount ELSE 0 END), 0) AS pending_commission,
                   COALESCE(SUM(CASE WHEN rc.status = 'approved' THEN rc.net_commission_amount ELSE 0 END), 0) AS approved_commission,
                   COALESCE(SUM(CASE WHEN rc.status = 'paid' THEN rc.net_commission_amount ELSE 0 END), 0) AS paid_commission
            FROM referral_agents ra
            INNER JOIN users u ON ra.user_id = u.id
            LEFT JOIN referral_commissions rc ON rc.agent_id = ra.id
            GROUP BY ra.id
            ORDER BY FIELD(ra.status, 'pending', 'approved', 'suspended', 'rejected'), ra.created_at DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function incrementClicks(string $code): bool
    {
        $stmt = $this->pdo->prepare("
            UPDATE referral_agents
            SET total_clicks = total_clicks + 1
            WHERE UPPER(referral_code) = UPPER(?) AND status = 'approved'
        ");
        $stmt->execute([trim($code)]);
        return $stmt->rowCount() > 0;
    }

    public function recordCommission(array $agent, int $bookingId, array $breakdown)
    {
        $rules = $breakdown['rules'];
        $stmt = $this->pdo->prepare("
            INSERT INTO referral_commissions (
                agent_id, user_id, booking_id, referral_code,
                gross_amount, guest_discount_amount, net_booking_amount,
                company_discount_share, agent_discount_share,
                gross_commission_amount, net_commission_amount,
                commission_type, commission_rate,
                guest_discount_type, guest_discount_rate,
                discount_bear_mode, agent_discount_share_percent,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        ");

        $stmt->execute([
            $agent['id'],
            $agent['user_id'],
            $bookingId,
            $agent['referral_code'],
            $breakdown['gross_amount'],
            $breakdown['guest_discount_amount'],
            $breakdown['net_booking_amount'],
            $breakdown['company_discount_share'],
            $breakdown['agent_discount_share'],
            $breakdown['gross_commission_amount'],
            $breakdown['net_commission_amount'],
            $rules['commission_type'],
            $rules['commission_value'],
            $rules['guest_discount_type'],
            $rules['guest_discount_value'],
            $rules['discount_bear_mode'],
            $rules['agent_discount_share_percent'],
        ]);

        return $this->pdo->lastInsertId();
    }

    public function getCommissionsByAgentId(int $agentId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT rc.*,
                   b.tour_date,
                   b.status AS booking_status,
                   b.guests,
                   SUBSTRING_INDEX(b.name, ' ', 1) AS guest_first_name,
                   COALESCE(t.tour_page_title, t.homepage_title) AS tour_title
            FROM referral_commissions rc
            INNER JOIN bookings b ON rc.booking_id = b.id
            LEFT JOIN tour_packages t ON b.tour_package_id = t.id
            WHERE rc.agent_id = ?
            ORDER BY rc.created_at DESC
        ");
        $stmt->execute([$agentId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllCommissions(?string $status = null, ?int $agentId = null): array
    {
        $sql = "
            SELECT rc.*,
                   u.name AS agent_name,
                   u.email AS agent_email,
                   b.name AS guest_name,
                   b.email AS guest_email,
                   b.tour_date,
                   b.status AS booking_status,
                   COALESCE(t.tour_page_title, t.homepage_title) AS tour_title,
                   inv.invoice_number,
                   inv.payment_status AS invoice_payment_status
            FROM referral_commissions rc
            INNER JOIN referral_agents ra ON rc.agent_id = ra.id
            INNER JOIN users u ON ra.user_id = u.id
            INNER JOIN bookings b ON rc.booking_id = b.id
            LEFT JOIN tour_packages t ON b.tour_package_id = t.id
            LEFT JOIN invoices inv ON inv.booking_id = b.id
            WHERE 1=1
        ";
        $params = [];

        if (!empty($status) && $status !== 'all') {
            $sql .= " AND rc.status = ?";
            $params[] = $status;
        }
        if (!empty($agentId)) {
            $sql .= " AND rc.agent_id = ?";
            $params[] = $agentId;
        }

        $sql .= " ORDER BY rc.created_at DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateCommissionStatus(int $commissionId, string $status, ?string $payoutRef = null, ?string $payoutNotes = null)
    {
        if (!in_array($status, ['pending', 'approved', 'paid', 'cancelled'], true)) {
            throw new Exception('Invalid commission status');
        }

        $paidAt = ($status === 'paid') ? date('Y-m-d H:i:s') : null;
        $stmt = $this->pdo->prepare("
            UPDATE referral_commissions
            SET status = ?,
                payout_reference = COALESCE(?, payout_reference),
                payout_notes = COALESCE(?, payout_notes),
                paid_at = CASE WHEN ? = 'paid' THEN COALESCE(paid_at, ?) ELSE paid_at END,
                updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$status, $payoutRef, $payoutNotes, $status, $paidAt, $commissionId]);
        return $stmt->rowCount() > 0;
    }

    public function syncStatusByBookingId(int $bookingId, string $bookingStatus): void
    {
        $settings = $this->getSettings();
        if (in_array($bookingStatus, ['accepted', 'confirmed', 'completed'], true)) {
            if (!empty($settings['auto_approve_on_booking_confirm'])) {
                $stmt = $this->pdo->prepare("
                    UPDATE referral_commissions
                    SET status = 'approved', updated_at = NOW()
                    WHERE booking_id = ? AND status = 'pending'
                ");
                $stmt->execute([$bookingId]);
            }
        } elseif (in_array($bookingStatus, ['rejected', 'cancelled'], true)) {
            $stmt = $this->pdo->prepare("
                UPDATE referral_commissions
                SET status = 'cancelled', updated_at = NOW()
                WHERE booking_id = ? AND status IN ('pending', 'approved')
            ");
            $stmt->execute([$bookingId]);
        }
    }

    public function getCommissionByBookingId(int $bookingId)
    {
        $stmt = $this->pdo->prepare("
            SELECT rc.*, u.name AS agent_name, u.email AS agent_email
            FROM referral_commissions rc
            INNER JOIN referral_agents ra ON rc.agent_id = ra.id
            INNER JOIN users u ON ra.user_id = u.id
            WHERE rc.booking_id = ?
            LIMIT 1
        ");
        $stmt->execute([$bookingId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function deleteCommissionByBookingId(int $bookingId): void
    {
        $stmt = $this->pdo->prepare("DELETE FROM referral_commissions WHERE booking_id = ? AND status != 'paid'");
        $stmt->execute([$bookingId]);
    }
}
