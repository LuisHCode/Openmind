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

    $api->group('/curso', function (RouteCollectorProxy $endpoint) {
        $endpoint->post('', Curso::class . ':create');
        $endpoint->put('/{idCurso}', Curso::class . ':update');
        $endpoint->get('/{idCurso}', Curso::class . ':read');
        $endpoint->delete('/{idCurso}', Curso::class . ':delete');
        $endpoint->get('', Curso::class . ':getAll');
        $endpoint->get('/matriculados/{idCurso}', Curso::class . ':getMatriculados');
        $endpoint->get('/creador/{idCreador}', Curso::class . ':getByCreador');
    });

    $api->group('/matricula', function (RouteCollectorProxy $endpoint) {
        $endpoint->post('/{idCurso}', Matricula::class . ':create');
        $endpoint->put('/{idMatricula}', Matricula::class . ':update');
        $endpoint->get('', Matricula::class . ':read');
        $endpoint->delete('/{idMatricula}', Matricula::class . ':delete');
    });

    $api->group('/auth', function (RouteCollectorProxy $endpoint) {
        $endpoint->patch('/login', Auth::class . ':login');
        $endpoint->patch('/refrescar', Auth::class . ':refrescar');
        $endpoint->patch('/cerrar', Auth::class . ':cerrar');
        $endpoint->post('/signin', Auth::class . ':register');
        $endpoint->post('/validate', Auth::class . ':validateToken');
    });
});