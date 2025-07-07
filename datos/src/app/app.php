<?php

use Slim\Factory\AppFactory;
use DI\Container;

require __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable('/var/www/html');
$dotenv->load();

$container = new Container();

AppFactory::SetContainer($container);

$app = AppFactory::create();

require 'config.php';

// Middleware JWT
$app->add(new Tuupola\Middleware\JwtAuthentication([
  "secure" => false,
  "path" => ["/api"],
  "ignore" => ["/api"],
  "secret" => ["acme" => $container->get('key')],
  "algorithm" => ["acme" => "HS256"],
]));

// Middleware personalizado: verifica que el token sea el activo en la base de datos SOLO para rutas distintas de /api/auth
require __DIR__ . '/StrictJwtMiddleware.php';
$app->add(function ($request, $handler) use ($container) {
    $path = $request->getUri()->getPath();
    if (preg_match('#^/api/auth#', $path)) {
        // No aplicar el middleware a /api/auth
        return $handler->handle($request);
    }
    $middleware = new \App\middleware\StrictJwtMiddleware($container);
    return $middleware->process($request, $handler);
});

require 'conexion.php';
require 'routes.php';

$app->run();