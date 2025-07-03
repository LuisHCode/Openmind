<?php
namespace App\controllers;

use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class Matricula
{
    protected $container;

    public function __construct(ContainerInterface $c)
    {
        $this->container = $c;
    }

    public function create(Request $request, Response $response, $args)
    {
        $idCurso = $args['idCurso'];
        $data = json_decode($request->getBody(), true);
        $idUsuario = $data['idUsuario'];

        $sql = "SELECT fn_create_matricula(:idUsuario, :idCurso) AS resultado";

        $pdo = $this->container->get('OMbase_datos'); // Usando tu contenedor

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'idUsuario' => $idUsuario,
            'idCurso' => $idCurso
        ]);

        $resultado = $stmt->fetchColumn();

        if ($resultado == 0) {
            return $this->respondWithJson($response, ['mensaje' => 'Matricula creada correctamente'], 201);
        } elseif ($resultado == 1) {
            return $this->respondWithJson($response, ['error' => 'El curso o el usuario no existe'], 409);
        } elseif ($resultado == 2) {
            return $this->respondWithJson($response, ['error' => 'El usuario ya está matriculado al curso'], 409);
        } elseif ($resultado == 3) {
            return $this->respondWithJson($response, ['error' => 'El creador del curso no puede matricularse al mismo curso'], 409);
        } elseif ($resultado == 4) {
            return $this->respondWithJson($response, ['error' => 'Ya no hay cupos en el curso'], 409);
        }
        return $this->respondWithJson($response, ['error' => 'Error desconocido'], 500);
    }

    public function read(Request $request, Response $response, $args)
    {
        if ($request->getMethod() === 'GET') {
            $params = $request->getQueryParams();
            $idUsuario = $params['idUsuario'] ?? null;
            $idCurso = $params['idCurso'] ?? null;
        } else {
            $data = json_decode($request->getBody(), true);
            $idUsuario = $data['idUsuario'] ?? null;
            $idCurso = $data['idCurso'] ?? null;
        }

        $sql = "CALL sp_get_matricula(:idUsuario, :idCurso)";
        $pdo = $this->container->get('OMbase_datos');
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'idUsuario' => $idUsuario,
            'idCurso' => $idCurso
        ]);

        $curso = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($curso && $curso['id'] !== null) {
            return $this->respondWithJson($response, $curso, 200);
        }
        return $this->respondWithJson($response, ['error' => 'Curso o usuario no encontrado, valida ingresar todos los datos o valida que son correctos'], 404);
    }

    public function update(Request $request, Response $response, $args)
    {
        $idMatricula = $args['idMatricula'];
        $data = json_decode($request->getBody(), true);
        $idUsuario = $data['idUsuario'] ?? null;
        $idCurso = $data['idCurso'] ?? null;
        $fecha_matricula = $data['fecha_matricula'] ?? null;

        $sql = "SELECT fn_update_matricula(:idMatricula, :idUsuario, :idCurso, :fecha_matricula) AS resultado";

        $pdo = $this->container->get('OMbase_datos'); // Usando tu contenedor

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'idMatricula' => $idMatricula,
            'idUsuario' => $idUsuario,
            'idCurso' => $idCurso,
            'fecha_matricula' => $fecha_matricula
        ]);

        $resultado = $stmt->fetchColumn();

        if ($resultado == 0) {
            return $this->respondWithJson($response, ['mensaje' => 'Curso modificado correctamente'], 201);
        } elseif ($resultado == 1) {
            return $this->respondWithJson($response, ['error' => 'Esa matricula no existe'], 409);
        } elseif ($resultado == 2) {
            return $this->respondWithJson($response, ['error' => 'Curso nuevo a matricular no existe'], 409);
        } elseif ($resultado == 3) {
            return $this->respondWithJson($response, ['error' => 'Curso nuevo a matricular no posee cupo'], 409);
        } elseif ($resultado == 4) {
            return $this->respondWithJson($response, ['error' => 'Usuario nuevo a matricular no existe'], 409);
        } elseif ($resultado == 5) {
            return $this->respondWithJson($response, ['error' => 'El usuario es el creador del grupo, no se puede matricular'], 409);
        }

        return $this->respondWithJson($response, ['error' => 'Error desconocido'], 500);
    }

    public function delete(Request $request, Response $response, $args)
    {
        $idCurso = $args['idCurso'];

        $sql = "SELECT fn_delete_curso(:idCurso) AS resultado";

        $pdo = $this->container->get('OMbase_datos'); // Usando tu contenedor

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'idCurso' => $idCurso
        ]);

        $resultado = $stmt->fetchColumn();

        if ($resultado == 0) {
            return $this->respondWithJson($response, ['mensaje' => 'Curso eliminado correctamente'], 201);
        } elseif ($resultado == 1) {
            return $this->respondWithJson($response, ['error' => 'No se encontro el curso'], 409);
        }

        return $this->respondWithJson($response, ['error' => 'Error desconocido'], 500);
    }

    // Reemplaza todos los usos de withJson por la función respondWithJson
    private function respondWithJson(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }
}
