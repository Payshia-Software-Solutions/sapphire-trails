<?php

require_once __DIR__ . '/../controllers/mailController.php';
require_once __DIR__ . '/../lib/AuthMiddleware.php';

$pdo = $GLOBALS['pdo'];
$mailController = new MailController($pdo);

return [
    'GET /mail/settings/' => function () use ($mailController) {
        AuthMiddleware::requireAdmin();
        $mailController->getSettings();
    },
    'GET /mail/settings' => function () use ($mailController) {
        AuthMiddleware::requireAdmin();
        $mailController->getSettings();
    },
    'POST /mail/settings/' => function () use ($mailController) {
        AuthMiddleware::requireAdmin();
        $mailController->updateSettings();
    },
    'POST /mail/settings' => function () use ($mailController) {
        AuthMiddleware::requireAdmin();
        $mailController->updateSettings();
    },
    'POST /mail/test/' => function () use ($mailController) {
        AuthMiddleware::requireAdmin();
        $mailController->sendTest();
    },
    'POST /mail/test' => function () use ($mailController) {
        AuthMiddleware::requireAdmin();
        $mailController->sendTest();
    },
    'GET /mail/logs/' => function () use ($mailController) {
        AuthMiddleware::requireAdmin();
        $mailController->getLogs();
    },
    'GET /mail/logs' => function () use ($mailController) {
        AuthMiddleware::requireAdmin();
        $mailController->getLogs();
    },
    'POST /mail/logs/clear/' => function () use ($mailController) {
        AuthMiddleware::requireAdmin();
        $mailController->clearLogs();
    },
    'POST /mail/logs/clear' => function () use ($mailController) {
        AuthMiddleware::requireAdmin();
        $mailController->clearLogs();
    },
];
