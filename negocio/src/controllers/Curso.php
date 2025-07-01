<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Container\ContainerInterface;

class Curso extends ServicioCURL
{
    protected $container;
    private const ENDPOINT = '/curso';

    public function __construct(ContainerInterface $c)
    {
        $this->container = $c;
    }

    public function read(Request $request, Response $response, $args)
    {
        $url = self::ENDPOINT;
        if (isset($args['idCurso'])) {
            $url .= '/' . $args['idCurso'];
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
        $body = $request->getBody();
        $respA = $this->ejecutarCURL(self::ENDPOINT, 'POST', $body);
        return $response->withStatus($respA['status']);
    }

    public function update(Request $request, Response $response, $args)
    {
        $body = $request->getBody();
        $respA = $this->ejecutarCURL(self::ENDPOINT . '/' . $args['idCurso'], 'PUT', $body);
        return $response->withStatus($respA['status']);
    }

    public function delete(Request $request, Response $response, $args)
    {
        $respA = $this->ejecutarCURL(self::ENDPOINT . '/' . $args['idCurso'], 'DELETE');
        return $response->withStatus($respA['status']);
    }
}
