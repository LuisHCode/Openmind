<?php
namespace App\middleware;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use PDO;
use Slim\Psr7\Response as SlimResponse;

class StrictJwtMiddleware implements MiddlewareInterface
{
    protected $container;
    protected $secret;

    public function __construct($container)
    {
        $this->container = $container;
        $this->secret = $container->get('key');
    }

    public function process(Request $request, RequestHandler $handler): Response
    {
        $authHeader = $request->getHeaderLine('Authorization');
        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $this->unauthorized();
        }
        $jwt = $matches[1];
        try {
            $decoded = JWT::decode($jwt, new Key($this->secret, 'HS256'));
        } catch (\Exception $e) {
            return $this->unauthorized();
        }
        // Obtener email o id del token
        $userId = $decoded->sub ?? null;
        $email = $decoded->email ?? null;
        if (!$userId && !$email) {
            return $this->unauthorized();
        }
        // Consultar tkref en la base de datos
        $pdo = $this->container->get('OMbase_datos');
        $stmt = $pdo->prepare('SELECT tkref FROM usuarios WHERE id = :id OR email = :email');
        $stmt->execute(['id' => $userId, 'email' => $email]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row || !$row['tkref']) {
            return $this->unauthorized();
        }
        // El token debe coincidir exactamente con el tkref guardado
        if ($jwt !== $row['tkref']) {
            return $this->unauthorized();
        }
        // Token válido y activo
        return $handler->handle($request);
    }

    private function unauthorized(): Response
    {
        $response = new SlimResponse();
        $response->getBody()->write(json_encode(['error' => 'Token inválido o no autorizado']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
    }
}
