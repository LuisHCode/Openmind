<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Container\ContainerInterface;

class Matricula extends ServicioCURL
{
    protected $container;
    private const ENDPOINT = '/matricula';

    public function __construct(ContainerInterface $c)
    {
        $this->container = $c;
    }

public function filtrar(Request $request, Response $response, $args)
{
    if ($request->getMethod() === 'GET') {
        $idUsuario = $request->getQueryParams()['idUsuario'] ?? null;
        $idCurso = $request->getQueryParams()['idCurso'] ?? null;
    } else {
        $data = json_decode($request->getBody()->getContents(), true);
        $idUsuario = $data['idUsuario'] ?? null;
        $idCurso = $data['idCurso'] ?? null;
    }

    $query = [];
    if (!is_null($idUsuario)) $query['idUsuario'] = $idUsuario;
    if (!is_null($idCurso)) $query['idCurso'] = $idCurso;

    $url = $this::ENDPOINT;
    if (!empty($query)) {
        $url .= '?' . http_build_query($query);
    }

    $respA = $this->ejecutarCURL($url, 'GET');

    if ($respA['resp'] === false) {
        $response->getBody()->write(json_encode(['error' => 'No se pudo conectar con la API.']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }

    $response->getBody()->write($respA['resp']);
    return $response->withHeader('Content-Type', 'application/json')->withStatus($respA['status']);
}

    public function create(Request $request, Response $response, $args)
    {
        $idCurso = $args['idCurso'] ?? null;
        $body = $request->getBody();

        $respA = $this->ejecutarCURL($this::ENDPOINT . '/' . $idCurso, 'POST', $body);
        return $response->withStatus($respA['status']);
    }

    public function update(Request $request, Response $response, $args)
    {
        $idMatricula = $args['idMatricula'] ?? null;
        $body = $request->getBody();

        $respA = $this->ejecutarCURL($this::ENDPOINT . '/' . $idMatricula, 'PUT', $body);
        return $response->withStatus($respA['status']);
    }

    public function delete(Request $request, Response $response, $args)
    {
        $idMatricula = $args['idMatricula'] ?? null;

        $respA = $this->ejecutarCURL($this::ENDPOINT . '/' . $idMatricula, 'DELETE');
        return $response->withStatus($respA['status']);
    }
}
