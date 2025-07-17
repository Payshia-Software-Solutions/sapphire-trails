<?php
require_once './controllers/SiteContentController.php';

return function ($router) {
    $controller = new SiteContentController($GLOBALS['pdo']);
    
    $router->get('/{section_key}', [$controller, 'getSection']);
    $router->post('/{section_key}', [$controller, 'updateSection']);
};
?>
