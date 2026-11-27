<?php
require_once __DIR__ . '/../controllers/referralController.php';
require_once __DIR__ . '/../lib/AuthMiddleware.php';

$pdo = $GLOBALS['pdo'];
$referralController = new ReferralController($pdo);

return [
    // Public: validate referral code & preview guest discount
    'GET /referrals/validate/{code}/' => function ($code) use ($referralController) {
        $referralController->validateCode($code);
    },

    // Public: track referral link click
    'POST /referrals/track-click/' => function () use ($referralController) {
        $referralController->trackClick();
    },

    // Authenticated customer: get own agent profile & commissions
    'GET /referrals/my/' => function () use ($referralController) {
        $user = AuthMiddleware::requireAuth();
        $referralController->getMyReferralProfile($user);
    },

    // Authenticated customer: apply to become a referral agent
    'POST /referrals/apply/' => function () use ($referralController) {
        $user = AuthMiddleware::requireAuth();
        $referralController->applyForAgent($user);
    },

    // Admin: global referral settings
    'GET /referrals/settings/' => function () use ($referralController) {
        AuthMiddleware::requireAdmin();
        $referralController->getSettings();
    },
    'POST /referrals/settings/' => function () use ($referralController) {
        AuthMiddleware::requireAdmin();
        $referralController->updateSettings();
    },

    // Admin: manage referral agents (approve, assign custom rates, suspend)
    'GET /referrals/agents/' => function () use ($referralController) {
        AuthMiddleware::requireAdmin();
        $referralController->getAllAgents();
    },
    'POST /referrals/agents/' => function () use ($referralController) {
        $admin = AuthMiddleware::requireAdmin();
        $referralController->createOrEnableAgent($admin);
    },
    'PUT /referrals/agents/{id}/' => function ($id) use ($referralController) {
        $admin = AuthMiddleware::requireAdmin();
        $referralController->updateAgent($id, $admin);
    },

    // Admin: commission ledger & payouts
    'GET /referrals/commissions/' => function () use ($referralController) {
        AuthMiddleware::requireAdmin();
        $referralController->getAllCommissions();
    },
    'PUT /referrals/commissions/{id}/status/' => function ($id) use ($referralController) {
        AuthMiddleware::requireAdmin();
        $referralController->updateCommissionStatus($id);
    },
];
