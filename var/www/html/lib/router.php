<?php
class Router
{
    protected $routes = [];

    private function addRoute($method, $uri, $handler)
    {
        $this->routes[] = ['method' => $method, 'uri' => $uri, 'handler' => $handler];
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
            header("HTTP/1.1 204 No Content");
            exit;
        }
        
        header('Content-Type: application/json');

        foreach ($this->routes as $route) {
            $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '([a-zA-Z0-9_\-]+)', $route['uri']);
            $pattern = '#^' . $pattern . '$#';

            if ($route['method'] === $method && preg_match($pattern, $uri, $matches)) {
                array_shift($matches);
                call_user_func_array($route['handler'], $matches);
                return;
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Not Found', 'requested_uri' => $uri, 'method' => $method]);
    }
}
?>