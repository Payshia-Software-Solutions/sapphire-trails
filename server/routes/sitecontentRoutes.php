<?php
require_once __DIR__ . '/../controllers/sitecontentController.php';
require_once __DIR__ . '/../lib/AuthMiddleware.php';

$pdo = $GLOBALS['pdo'];
$controller = new SiteContentController($pdo);

return [
    'POST /content/upload-image/' => function () use ($controller) {
        AuthMiddleware::requireAdmin();
        $controller->uploadImage();
    },
    'GET /content/{section_key}/' => function ($section_key) use ($controller) {
        $controller->getSection($section_key);
    },
    'POST /content/{section_key}/' => function ($section_key) use ($controller) {
        AuthMiddleware::requireAdmin();
        $controller->updateSection($section_key);
    },
];

