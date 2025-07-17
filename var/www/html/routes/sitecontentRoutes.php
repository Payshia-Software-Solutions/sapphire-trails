<?php
require_once './controllers/SiteContentController.php';

return function ($router) {
    $controller = new SiteContentController($GLOBALS['pdo']);

    $router->get('/{section_key}', function($section_key) use ($controller) {
        $controller->getSection($section_key);
    });
    
    $router->post('/{section_key}', function($section_key) use ($controller) {
        $controller->updateSection($section_key);
    });
};
?>