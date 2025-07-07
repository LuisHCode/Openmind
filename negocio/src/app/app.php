<?php
   
    use Slim\Factory\AppFactory;
    use DI\Container;

    require __DIR__ . '/../../vendor/autoload.php';

    $container = new Container();

    AppFactory::SetContainer($container);
    require "config.php";
    
    $app = AppFactory::create();

    // Middleware personalizado: ignora /api/auth
    $app->add(function ($request, $handler) use ($container) {
        $path = $request->getUri()->getPath();
        if (preg_match('#^/api/auth#', $path)) {
            // No aplicar el middleware a /api/auth
            return $handler->handle($request);
        }
        $middleware = new \App\middleware\JwtMiddleware($container);
        return $middleware->process($request, $handler);
    });

    require "routes.php";

    $app->run();