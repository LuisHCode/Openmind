<?php
namespace App\middleware;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Response as SlimResponse;

class JwtMiddleware implements MiddlewareInterface
{
    protected $container;

    public function __construct($container)
    {
        $this->container = $container;
    }

    public function process(Request $request, RequestHandler $handler): Response
    {
        $authHeader = $request->getHeaderLine('Authorization');
        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $this->unauthorized();
        }
        $jwt = $matches[1];
        $result = $this->validarTokenEnDatos($jwt);
        if ($result['valido']) {
            return $handler->handle($request);
        } else {
            return $this->unauthorized();
        }
    }

    private function validarTokenEnDatos($jwt)
    {
        $url = 'http://omweb_datos/api/auth/validate';
        $headers = [
            'Authorization: Bearer ' . $jwt,
            'Content-Type: application/json'
        ];
        $body = json_encode([]);
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        $resp = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $data = json_decode($resp, true);
        return [
            'valido' => ($status === 200 && isset($data['valido']) && $data['valido'] === true)
        ];
    }

    private function unauthorized(): Response
    {
        $response = new SlimResponse();
        $response->getBody()->write(json_encode([
            'error' => 'Token inválido o no autorizado'
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
    }
}
