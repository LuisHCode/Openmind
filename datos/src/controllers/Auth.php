<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Container\ContainerInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use PDO;

class Auth
{
    protected $container;
    private $secret = 'TU_SECRETO_JWT'; // Cambia esto por un valor seguro

    public function __construct(ContainerInterface $c)
    {
        $this->container = $c;
    }

    public function login(Request $request, Response $response, $args)
    {
        $data = json_decode($request->getBody(), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        $pdo = $this->container->get('OMbase_datos');
        $stmt = $pdo->prepare('SELECT * FROM usuarios WHERE email = :email');
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            $payload = [
                'sub' => $user['id'],
                'email' => $user['email'],
                'nombre' => $user['nombre'],
                'iat' => time(),
                'exp' => time() + 600
            ];
            $tk = JWT::encode($payload, $this->secret, 'HS256');
            $tkref = JWT::encode(array_merge($payload, ['ref' => true]), $this->secret, 'HS256');
            // Guardar tkref en la base de datos
            $pdo->prepare('SELECT fn_modificar_token(:email, :tkref)')->execute([
                'email' => $email,
                'tkref' => $tkref
            ]);
            return $this->respondWithJson($response, [
                'tk' => $tk,
                'tkref' => $tkref
            ]);
        } else {
            return $this->respondWithJson($response, ['error' => 'Credenciales inválidas'], 401);
        }
    }

    public function refrescar(Request $request, Response $response, $args)
    {
        $data = json_decode($request->getBody(), true);
        $tkref = $data['tkref'] ?? '';
        $email = $data['email'] ?? '';
        $pdo = $this->container->get('OMbase_datos');
        // Verificar que el tkref sea válido para el usuario
        $stmt = $pdo->prepare('CALL sp_verificar_token(:email, :tkref)');
        $stmt->execute([
            'email' => $email,
            'tkref' => $tkref
        ]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $stmt->closeCursor(); // Cierra el cursor antes de ejecutar otra consulta
        if ($row && isset($row['id'])) {
            $decoded = JWT::decode($tkref, new Key($this->secret, 'HS256'));
            $payload = [
                'sub' => $decoded->sub,
                'email' => $decoded->email,
                'nombre' => $decoded->nombre,
                'iat' => time(),
                'exp' => time() + 600 
            ];
            $tk = JWT::encode($payload, $this->secret, 'HS256');
            $tkref_new = JWT::encode(array_merge($payload, ['ref' => true]), $this->secret, 'HS256');
            // Actualizar tkref en la base de datos
            $pdo->prepare('SELECT fn_modificar_token(:email, :tkref)')->execute([
                'email' => $email,
                'tkref' => $tkref_new
            ]);
            return $this->respondWithJson($response, [
                'tk' => $tk,
                'tkref' => $tkref_new
            ]);
        } else {
            return $this->respondWithJson($response, ['error' => 'Token inválido'], 401);
        }
    }

    public function cerrar(Request $request, Response $response, $args)
    {
        $data = json_decode($request->getBody(), true);
        $email = $data['email'] ?? '';
        $pdo = $this->container->get('OMbase_datos');
        // Borrar tkref (ponerlo en NULL)
        $pdo->prepare('SELECT fn_modificar_token(:email, NULL)')->execute([
            'email' => $email
        ]);
        return $this->respondWithJson($response, ['mensaje' => 'Sesión cerrada'], 200);
    }

    public function register(Request $request, Response $response, $args)
    {
        $data = json_decode($request->getBody(), true);
        $nombre = $data['nombre'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        if (!$nombre || !$email || !$password) {
            return $this->respondWithJson($response, ['error' => 'Faltan datos obligatorios'], 400);
        }
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $pdo = $this->container->get('OMbase_datos');
        $stmt = $pdo->prepare('SELECT fn_create_usuario(:nombre, :email, :password) AS existe');
        $stmt->execute([
            'nombre' => $nombre,
            'email' => $email,
            'password' => $hashedPassword
        ]);
        $existe = $stmt->fetchColumn();
        if ($existe == 0) {
            return $this->respondWithJson($response, ['mensaje' => 'Usuario registrado correctamente'], 201);
        } else {
            return $this->respondWithJson($response, ['error' => 'El email ya está registrado'], 409);
        }
    }

    public function validateToken(Request $request, Response $response, $args)
    {
        $authHeader = $request->getHeaderLine('Authorization');
        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $this->respondWithJson($response, [
                'valido' => false,
                'error' => 'No se encontró el token en el header'
            ], 401);
        }
        $jwt = $matches[1];
        try {
            $decoded = JWT::decode($jwt, new Key($this->secret, 'HS256'));
            $pdo = $this->container->get('OMbase_datos');
            $stmt = $pdo->prepare('SELECT tkref FROM usuarios WHERE id = :id OR email = :email');
            $stmt->execute(['id' => $decoded->sub ?? null, 'email' => $decoded->email ?? null]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $tkref_db = $row['tkref'] ?? null;
            if (!$tkref_db || $jwt !== $tkref_db) {
                return $this->respondWithJson($response, [
                    'valido' => false,
                    'error' => 'Token no activo o no coincide (solo tkref válido)'
                ], 401);
            }
            return $this->respondWithJson($response, [
                'valido' => true
            ]);
        } catch (\Exception $e) {
            return $this->respondWithJson($response, [
                'valido' => false,
                'error' => $e->getMessage()
            ], 401);
        }
    }

    private function respondWithJson(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}