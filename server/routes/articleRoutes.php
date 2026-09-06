<?php
require_once __DIR__ . '/../controllers/articleController.php';
require_once __DIR__ . '/../lib/AuthMiddleware.php';

$pdo = $GLOBALS['pdo'];
$articleController = new ArticleController($pdo);

return [
    // Public routes
    'GET /articles' => function () use ($articleController) {
        $articleController->getAll();
    },
    'GET /articles/' => function () use ($articleController) {
        $articleController->getAll();
    },
    'GET /articles/{identifier}' => function ($identifier) use ($articleController) {
        $articleController->getBySlugOrId($identifier);
    },
    'GET /articles/{identifier}/' => function ($identifier) use ($articleController) {
        $articleController->getBySlugOrId($identifier);
    },
    'GET /articles/slug/{slug}' => function ($slug) use ($articleController) {
        $articleController->getBySlugOrId($slug);
    },
    'GET /articles/slug/{slug}/' => function ($slug) use ($articleController) {
        $articleController->getBySlugOrId($slug);
    },

    // Admin protected routes
    'POST /articles' => function () use ($articleController) {
        AuthMiddleware::requireAdmin();
        $articleController->create();
    },
    'POST /articles/' => function () use ($articleController) {
        AuthMiddleware::requireAdmin();
        $articleController->create();
    },
    'POST /articles/{identifier}' => function ($identifier) use ($articleController) {
        AuthMiddleware::requireAdmin();
        $articleController->update($identifier);
    },
    'POST /articles/{identifier}/' => function ($identifier) use ($articleController) {
        AuthMiddleware::requireAdmin();
        $articleController->update($identifier);
    },
    'PUT /articles/{identifier}' => function ($identifier) use ($articleController) {
        AuthMiddleware::requireAdmin();
        $articleController->update($identifier);
    },
    'PUT /articles/{identifier}/' => function ($identifier) use ($articleController) {
        AuthMiddleware::requireAdmin();
        $articleController->update($identifier);
    },
    'DELETE /articles/{identifier}' => function ($identifier) use ($articleController) {
        AuthMiddleware::requireAdmin();
        $articleController->delete($identifier);
    },
    'DELETE /articles/{identifier}/' => function ($identifier) use ($articleController) {
        AuthMiddleware::requireAdmin();
        $articleController->delete($identifier);
    },
];
