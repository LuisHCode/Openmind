<?php
namespace App\controllers;

use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class Usuario
{
    protected $container;

    public function __construct(ContainerInterface $c)
    {
        $this->container = $c;
    }

    public function create(Request $request, Response $response, $args)
    {
        $data = json_decode($request->getBody(), true);
        $nombre = $data['nombre'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        $sql = "SELECT fn_create_usuario(:nombre, :email, :password) AS resultado";

        $pdo = $this->container->get('OMbase_datos'); // Usando tu contenedor

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'nombre' => $nombre,
            'email' => $email,
            'password' => password_hash($password, PASSWORD_BCRYPT)
        ]);

        $resultado = $stmt->fetchColumn();

        if ($resultado == 0) {
            return $this->respondWithJson($response, ['mensaje' => 'Usuario creado correctamente'], 201);
        } elseif ($resultado == 1) {
            return $this->respondWithJson($response, ['error' => 'El correo ya está registrado'], 409);
        }

        return $this->respondWithJson($response, ['error' => 'Error desconocido'], 500);
    }

    public function read(Request $request, Response $response, $args)
    {
        $idUsuario = $args['idUsuario'];
        $sql = "CALL sp_get_usuario(:id)";

        $pdo = $this->container->get('OMbase_datos');
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $idUsuario]);

        $usuario = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($usuario && $usuario['id'] !== null) {
            return $this->respondWithJson($response, $usuario, 200);
        }

        return $this->respondWithJson($response, ['error' => 'Usuario no encontrado'], 404);
    }

    public function update(Request $request, Response $response, $args)
    {
        $data = json_decode($request->getBody(), true);
        $idUsuario = $args['idUsuario'];
        $nombre = $data['nombre'] ?? null;
        $email = $data['email'] ?? null;

        $sql = "SELECT fn_update_usuario(:idUsuario, :nombre, :email) AS resultado";

        $pdo = $this->container->get('OMbase_datos'); // Usando tu contenedor

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'idUsuario' => $idUsuario,
            'nombre' => $nombre,
            'email' => $email
        ]);

        $resultado = $stmt->fetchColumn();

        if ($resultado == 0) {
            return $this->respondWithJson($response, ['mensaje' => 'Usuario modificado correctamente'], 201);
        } elseif ($resultado == 1) {
            return $this->respondWithJson($response, ['error' => 'No se encontro el usuario'], 409);
        }

        return $this->respondWithJson($response, ['error' => 'Error desconocido'], 500);
    }

    public function delete(Request $request, Response $response, $args)
    {
        $idUsuario = $args['idUsuario'];

        $sql = "SELECT fn_delete_usuario(:idUsuario) AS resultado";

        $pdo = $this->container->get('OMbase_datos'); // Usando tu contenedor

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'idUsuario' => $idUsuario
        ]);

        $resultado = $stmt->fetchColumn();

        if ($resultado == 0) {
            return $this->respondWithJson($response, ['mensaje' => 'Usuario eliminado correctamente'], 201);
        } elseif ($resultado == 1) {
            return $this->respondWithJson($response, ['error' => 'No se encontro el usuario'], 409);
        }

        return $this->respondWithJson($response, ['error' => 'Error desconocido'], 500);
    }


    private function respondWithJson(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}
