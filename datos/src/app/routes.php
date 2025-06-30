<?php
namespace App\controllers;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

use Slim\Routing\RouteCollectorProxy;

$app->get('/', function (Request $request, Response $response, $args) {
    $response->getBody()->write("Probando su funcion");
    return $response;
});

$app->group('/api', function (RouteCollectorProxy $api) {
    $api->group('/usuario', function (RouteCollectorProxy $endpoint) {
        $endpoint->post('', Usuario::class . ':create');
        $endpoint->put('/{idUsuario}', Usuario::class . ':update');
        $endpoint->get('/{idUsuario}', Usuario::class . ':read');
        $endpoint->delete('/{idUsuario}', Usuario::class . ':delete');

    });
});