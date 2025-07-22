<?php
class Router
{
    protected $routes = [];

    private function addRoute($method, $uri, $handler)
    {
        // Normalize URI: remove trailing slash for consistency
        $normalized_uri = rtrim($uri, '/');
        if (empty($normalized_uri)) {
            $normalized_uri = '/';
        }
        $this->routes[] = ['method' => $method, 'uri' => $normalized_uri, 'handler' => $handler];
    }

    public function get($uri, $handler)
    {
        $this->addRoute('GET', $uri, $handler);
    }

    public function post($uri, $handler)
    {
        $this->addRoute('POST', $uri, $handler);
    }

    public function put($uri, $handler)
    {
        $this->addRoute('PUT', $uri, $handler);
    }

    public function delete($uri, $handler)
    {
        $this->addRoute('DELETE', $uri, $handler);
    }

    public function group($prefix, callable $callback)
    {
        $groupRouter = new Router();
        $callback($groupRouter);

        foreach ($groupRouter->routes as $route) {
            $this->addRoute(
                $route['method'],
                rtrim($prefix, '/') . '/' . ltrim($route['uri'], '/'),
                $route['handler']
            );
        }
    }

    public function dispatch($uri)
    {
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
        
        // Normalize the request URI by removing the trailing slash if it's not the root
        $normalized_uri = rtrim($uri, '/');
        if (empty($normalized_uri)) {
            $normalized_uri = '/';
        }

        foreach ($this->routes as $route) {
            // Replace placeholders like {id} with a named capture group
            $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?<$1>[a-zA-Z0-9_\-]+)', $route['uri']);
            $pattern = '#^' . $pattern . '$#';

            if ($route['method'] === $method && preg_match($pattern, $normalized_uri, $matches)) {
                // Remove numeric keys, leaving only named captures for parameters
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                call_user_func_array($route['handler'], $params);
                return;
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Route not found', 'requested_uri' => $uri, 'method' => $method]);
    }
}
?>
