<?php
require_once './controllers/BookingController.php';

$pdo = $GLOBALS['pdo'];
$controller = new BookingController($pdo);

return [
    'GET /' => function () use ($controller) {
        $controller->getAll();
    },
    'GET /{id}/' => function ($id) use ($controller) {
        $controller->getById($id);
    },
    'POST /' => function () use ($controller) {
        $controller->create();
    },
    'PUT /{id}/' => function ($id) use ($controller) {
        $controller->update($id);
    },
    'PUT /{id}/status/' => function ($id) use ($controller) {
        $controller->updateStatus($id);
    },
    'DELETE /{id}/' => function ($id) use ($controller) {
        $controller->delete($id);
    },
];
