<?php
require_once './controllers/sitecontentController.php';

$pdo = $GLOBALS['pdo'];
$controller = new SiteContentController($pdo);

return [
    'GET /content/{section_key}/' => function ($section_key) use ($controller) {
        $controller->getSection($section_key);
    },
    'POST /content/{section_key}/' => function ($section_key) use ($controller) {
        $controller->updateSection($section_key);
    },
];
?>
