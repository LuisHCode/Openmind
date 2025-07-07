<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Container\ContainerInterface;

class Usuario extends ServicioCURL
{
    protected $container;
    private const ENDPOINT = '/usuario';

    public function __construct(ContainerInterface $c)
    {
        $this->container = $c;
    }

    public function read(Request $request, Response $response, $args)
    {
        $url = $this::ENDPOINT;
        if (isset($args['idUsuario'])) {
            $url .= '/' . $args['idUsuario'];
        }
        $authHeader = $request->getHeaderLine('Authorization');
        $respA = $this->ejecutarCURL($url, 'GET', null, $authHeader);
        $status = $respA['status'];
        $json = json_decode($respA['resp'], true);
        $response->getBody()->write(json_encode($json));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    public function create(Request $request, Response $response, $args)
    {
        $body = $request->getBody();
        $authHeader = $request->getHeaderLine('Authorization');
        $respA = $this->ejecutarCURL($this::ENDPOINT, 'POST', $body, $authHeader);
        $status = $respA['status'];
        $json = json_decode($respA['resp'], true);
        $response->getBody()->write(json_encode($json));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    public function update(Request $request, Response $response, $args)
    {
        $body = $request->getBody();
        $authHeader = $request->getHeaderLine('Authorization');
        $respA = $this->ejecutarCURL($this::ENDPOINT . '/' . $args['idUsuario'], 'PUT', $body, $authHeader);
        $status = $respA['status'];
        $json = json_decode($respA['resp'], true);
        $response->getBody()->write(json_encode($json));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    public function delete(Request $request, Response $response, $args)
    {
        $authHeader = $request->getHeaderLine('Authorization');
        $respA = $this->ejecutarCURL($this::ENDPOINT . '/' . $args['idUsuario'], 'DELETE', null, $authHeader);
        $status = $respA['status'];
        $json = json_decode($respA['resp'], true);
        $response->getBody()->write(json_encode($json));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }
}
