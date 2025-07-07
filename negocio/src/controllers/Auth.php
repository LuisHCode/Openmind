<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Container\ContainerInterface;

class Auth extends ServicioCURL
{
    protected $container;
    private const ENDPOINT = '/auth';

    public function __construct(ContainerInterface $c)
    {
        $this->container = $c;
    }

    public function login(Request $request, Response $response, $args)
    {
        $body = $request->getBody();
        $authHeader = $request->getHeaderLine('Authorization');
        $respA = $this->ejecutarCURL(self::ENDPOINT . '/login', 'PATCH', $body, $authHeader);
        $response->getBody()->write($respA['resp']);
        return $response->withHeader('Content-Type', 'application/json')->withStatus($respA['status']);
    }

    public function refrescar(Request $request, Response $response, $args)
    {
        $body = $request->getBody();
        $authHeader = $request->getHeaderLine('Authorization');
        $respA = $this->ejecutarCURL(self::ENDPOINT . '/refrescar', 'PATCH', $body, $authHeader);
        $response->getBody()->write($respA['resp']);
        return $response->withHeader('Content-Type', 'application/json')->withStatus($respA['status']);
    }

    public function cerrar(Request $request, Response $response, $args)
    {
        $body = $request->getBody();
        $authHeader = $request->getHeaderLine('Authorization');
        $respA = $this->ejecutarCURL(self::ENDPOINT . '/cerrar', 'PATCH', $body, $authHeader);
        $response->getBody()->write($respA['resp']);
        return $response->withHeader('Content-Type', 'application/json')->withStatus($respA['status']);
    }

    public function register(Request $request, Response $response, $args)
    {
        $body = $request->getBody();
        $authHeader = $request->getHeaderLine('Authorization');
        $respA = $this->ejecutarCURL(self::ENDPOINT . '/register', 'POST', $body, $authHeader);
        $response->getBody()->write($respA['resp']);
        return $response->withHeader('Content-Type', 'application/json')->withStatus($respA['status']);
    }
}
