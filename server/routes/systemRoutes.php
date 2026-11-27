<?php

require_once __DIR__ . '/../controllers/systemController.php';
require_once __DIR__ . '/../lib/AuthMiddleware.php';

$pdo = $GLOBALS['pdo'];
$systemController = new SystemController($pdo);

return [
    'GET /system/schema-status/' => function () use ($systemController) {
        AuthMiddleware::requireAdmin();
        $systemController->getSchemaStatus();
    },

    'POST /system/schema-update/' => function () use ($systemController) {
        AuthMiddleware::requireAdmin();
        $systemController->runSchemaUpdate();
    },
];
