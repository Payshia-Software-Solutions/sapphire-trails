<?php
require_once __DIR__ . '/../models/Referral.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/TourPackage.php';
require_once __DIR__ . '/../lib/AuthMiddleware.php';
require_once __DIR__ . '/../lib/Mailer.php';

class ReferralController
{
    private $pdo;
    private $model;
    private $userModel;
    private $tourModel;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->model = new Referral($pdo);
        $this->userModel = new User($pdo);
        $this->tourModel = new TourPackage($pdo);
    }

    /**
     * Public: Validate a referral code and preview discount/total
     * GET /referrals/validate/{code}/?amount=10000&email=...
     */
    public function validateCode($code)
    {
        $settings = $this->model->getSettings();
        if (empty($settings['program_enabled'])) {
            http_response_code(400);
            echo json_encode(['valid' => false, 'error' => 'Referral program is currently paused.']);
            return;
        }

        $agent = $this->model->getApprovedAgentByCode((string)$code);
        if (!$agent) {
            http_response_code(404);
            echo json_encode(['valid' => false, 'error' => 'Invalid or inactive referral code.']);
            return;
        }

        // Prevent self-referral if caller is authenticated or passed email
        $currentUser = AuthMiddleware::authenticate();
        $callerEmail = trim((string)($_GET['email'] ?? ($currentUser['email'] ?? '')));
        $callerUserId = $currentUser['id'] ?? null;

        if (
            ($callerUserId && (int)$callerUserId === (int)$agent['user_id']) ||
            ($callerEmail !== '' && strcasecmp($callerEmail, (string)$agent['user_email']) === 0)
        ) {
            http_response_code(400);
            echo json_encode(['valid' => false, 'error' => 'You cannot apply your own referral code.']);
            return;
        }

        $grossAmount = isset($_GET['amount']) ? max(0.0, floatval($_GET['amount'])) : 0.0;
        $breakdown = $this->model->calculateBreakdown($grossAmount, $agent);
        $rules = $breakdown['rules'];

        $firstName = explode(' ', trim((string)$agent['user_name']))[0] ?? 'Partner';

        echo json_encode([
            'valid' => true,
            'code' => $agent['referral_code'],
            'agent_name' => $firstName,
            'eligible' => $breakdown['eligible'],
            'min_booking_amount' => $rules['min_booking_amount'],
            'guest_discount_type' => $rules['guest_discount_type'],
            'guest_discount_value' => $rules['guest_discount_value'],
            'gross_amount' => $breakdown['gross_amount'],
            'guest_discount_amount' => $breakdown['guest_discount_amount'],
            'net_booking_amount' => $breakdown['net_booking_amount'],
        ]);
    }

    /**
     * Public: Increment click counter for an approved referral code
     * POST /referrals/track-click/
     */
    public function trackClick()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $code = trim((string)($data['code'] ?? ''));
        if ($code === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Referral code is required']);
            return;
        }

        $ok = $this->model->incrementClicks($code);
        echo json_encode(['tracked' => $ok]);
    }

    /**
     * Authenticated User: Get my referral agent status, link, stats & commission history
     * GET /referrals/my/
     */
    public function getMyReferralProfile(array $currentUser)
    {
        $userId = (int)($currentUser['id'] ?? 0);
        $settings = $this->model->getSettings();
        $agent = $this->model->getAgentByUserId($userId);

        if (!$agent) {
            echo json_encode([
                'program_enabled' => (bool)$settings['program_enabled'],
                'agent' => null,
                'effective_rules' => $this->model->resolveEffectiveRules(null),
                'stats' => [
                    'total_clicks' => 0,
                    'total_referrals' => 0,
                    'pending_commission' => 0,
                    'approved_commission' => 0,
                    'paid_commission' => 0,
                    'total_discount_shared' => 0,
                ],
                'commissions' => [],
            ]);
            return;
        }

        $commissions = $this->model->getCommissionsByAgentId((int)$agent['id']);
        $stats = [
            'total_clicks' => (int)$agent['total_clicks'],
            'total_referrals' => 0,
            'pending_commission' => 0.0,
            'approved_commission' => 0.0,
            'paid_commission' => 0.0,
            'total_discount_shared' => 0.0,
        ];

        foreach ($commissions as $c) {
            if ($c['status'] === 'cancelled') continue;
            $stats['total_referrals']++;
            $stats['total_discount_shared'] += floatval($c['agent_discount_share']);
            if ($c['status'] === 'pending') {
                $stats['pending_commission'] += floatval($c['net_commission_amount']);
            } elseif ($c['status'] === 'approved') {
                $stats['approved_commission'] += floatval($c['net_commission_amount']);
            } elseif ($c['status'] === 'paid') {
                $stats['paid_commission'] += floatval($c['net_commission_amount']);
            }
        }

        echo json_encode([
            'program_enabled' => (bool)$settings['program_enabled'],
            'agent' => $agent,
            'effective_rules' => $this->model->resolveEffectiveRules($agent),
            'stats' => $stats,
            'commissions' => $commissions,
        ]);
    }

    /**
     * Authenticated User: Request to join the Referral Agent Program (awaits admin approval)
     * POST /referrals/apply/
     */
    public function applyForAgent(array $currentUser)
    {
        $userId = (int)($currentUser['id'] ?? 0);
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            return;
        }

        $settings = $this->model->getSettings();
        if (empty($settings['program_enabled'])) {
            http_response_code(400);
            echo json_encode(['error' => 'The referral agent program is currently closed.']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        try {
            $existing = $this->model->getAgentByUserId($userId);
            $agent = $this->model->applyForAgent($userId, $data);

            $shouldEmailApplication = $agent
                && $agent['status'] === 'pending'
                && (!$existing || $existing['status'] === 'rejected');

            if ($shouldEmailApplication) {
                try {
                    $mailer = new Mailer($this->pdo);
                    $mailer->sendReferralApplicationEmails($agent);
                } catch (\Throwable $mailErr) {
                    error_log('Referral application email failed: ' . $mailErr->getMessage());
                }
            }

            http_response_code(201);
            echo json_encode([
                'message' => $agent['status'] === 'approved'
                    ? 'Your referral agent account is already active.'
                    : 'Your referral agent application has been submitted for admin approval.',
                'agent' => $agent,
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * Admin: Get global referral settings
     */
    public function getSettings()
    {
        echo json_encode($this->model->getSettings());
    }

    /**
     * Admin: Update global referral settings
     */
    public function updateSettings()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON payload']);
            return;
        }

        try {
            $saved = $this->model->saveSettings($data);
            echo json_encode(['message' => 'Referral settings saved successfully', 'settings' => $saved]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * Admin: List all agents (and non-agent registered users for quick enablement)
     */
    public function getAllAgents()
    {
        $agents = $this->model->getAllAgents();
        $settings = $this->model->getSettings();
        foreach ($agents as &$a) {
            $a['effective_rules'] = $this->model->resolveEffectiveRules($a);
        }
        echo json_encode([
            'agents' => $agents,
            'settings' => $settings,
        ]);
    }

    /**
     * Admin: Directly enable/approve a registered customer as a referral agent
     * POST /referrals/agents/
     */
    public function createOrEnableAgent(array $adminUser)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON payload']);
            return;
        }

        $userId = isset($data['user_id']) ? (int)$data['user_id'] : 0;
        if ($userId <= 0 && !empty($data['email'])) {
            $user = $this->userModel->getByEmail(trim((string)$data['email']));
            if ($user) {
                $userId = (int)$user['id'];
            }
        }

        if ($userId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'A valid registered user_id or email is required']);
            return;
        }

        try {
            $before = $this->model->getAgentByUserId($userId);
            $wasApproved = $before && ($before['status'] ?? '') === 'approved';
            $beforeRules = $wasApproved ? $this->model->resolveEffectiveRules($before) : null;

            $agent = $this->model->createOrApproveAgentForUser($userId, $data, (int)($adminUser['id'] ?? 0));
            $effectiveRules = $this->model->resolveEffectiveRules($agent);
            $agent['effective_rules'] = $effectiveRules;

            if ($agent && ($agent['status'] ?? '') === 'approved') {
                $termsChanged = !$wasApproved
                    || ($before['referral_code'] ?? '') !== ($agent['referral_code'] ?? '')
                    || $this->didPartnerRulesChange($beforeRules, $effectiveRules);

                if ($termsChanged) {
                    try {
                        $mailer = new Mailer($this->pdo);
                        $mailer->sendReferralApprovalWithRatesEmail($agent, $effectiveRules, $wasApproved);
                    } catch (\Throwable $mailErr) {
                        error_log('Referral approval email failed: ' . $mailErr->getMessage());
                    }
                }
            }

            http_response_code(201);
            echo json_encode(['message' => 'Referral agent enabled successfully', 'agent' => $agent]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * Admin: Update agent status, code, or per-agent discount/commission/bear overrides
     * PUT /referrals/agents/{id}/
     */
    public function updateAgent($id, array $adminUser)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON payload']);
            return;
        }

        try {
            $before = $this->model->getAgentById((int)$id);
            $beforeStatus = $before['status'] ?? null;
            $beforeRules = $before ? $this->model->resolveEffectiveRules($before) : null;

            $data['approved_by'] = (int)($adminUser['id'] ?? 0);
            $updated = $this->model->updateAgent((int)$id, $data);
            if (!$updated) {
                http_response_code(404);
                echo json_encode(['error' => 'Referral agent not found']);
                return;
            }
            $effectiveRules = $this->model->resolveEffectiveRules($updated);
            $updated['effective_rules'] = $effectiveRules;

            $newStatus = $updated['status'] ?? '';
            try {
                $mailer = new Mailer($this->pdo);
                if ($newStatus === 'approved') {
                    $wasApproved = ($beforeStatus === 'approved');
                    $termsChanged = !$wasApproved
                        || ($before['referral_code'] ?? '') !== ($updated['referral_code'] ?? '')
                        || $this->didPartnerRulesChange($beforeRules, $effectiveRules);

                    if ($termsChanged) {
                        $mailer->sendReferralApprovalWithRatesEmail($updated, $effectiveRules, $wasApproved);
                    }
                } elseif ($newStatus !== $beforeStatus && in_array($newStatus, ['rejected', 'suspended'], true)) {
                    $mailer->sendReferralStatusNoticeEmail($updated, $newStatus);
                }
            } catch (\Throwable $mailErr) {
                error_log('Referral status update email failed: ' . $mailErr->getMessage());
            }

            echo json_encode(['message' => 'Referral agent updated successfully', 'agent' => $updated]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * Admin: Get all referral commissions with filters
     */
    public function getAllCommissions()
    {
        $status = $_GET['status'] ?? null;
        $agentId = isset($_GET['agent_id']) ? (int)$_GET['agent_id'] : null;
        $commissions = $this->model->getAllCommissions($status, $agentId);
        echo json_encode($commissions);
    }

    /**
     * Admin: Approve, mark as paid, or cancel a commission
     */
    public function updateCommissionStatus($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data) || empty($data['status'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Commission status is required']);
            return;
        }

        try {
            $ok = $this->model->updateCommissionStatus(
                (int)$id,
                trim((string)$data['status']),
                $data['payout_reference'] ?? null,
                $data['payout_notes'] ?? null
            );
            if (!$ok) {
                http_response_code(404);
                echo json_encode(['error' => 'Commission record not found or unchanged']);
                return;
            }
            echo json_encode(['message' => 'Commission status updated successfully']);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    private function didPartnerRulesChange(?array $before, array $after): bool
    {
        if (!$before) {
            return true;
        }
        $keys = [
            'commission_type',
            'commission_value',
            'commission_basis',
            'guest_discount_type',
            'guest_discount_value',
            'discount_bear_mode',
            'agent_discount_share_percent',
        ];
        foreach ($keys as $key) {
            if ((string)($before[$key] ?? '') !== (string)($after[$key] ?? '')) {
                return true;
            }
        }
        return false;
    }
}
