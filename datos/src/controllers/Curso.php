<?php
namespace App\controllers;

use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class Curso
{
    protected $container;

    public function __construct(ContainerInterface $c)
    {
        $this->container = $c;
    }

    public function create(Request $request, Response $response, $args)
    {
        $data = json_decode($request->getBody(), true);
        $titulo = $data['titulo'];
        $descripcion = $data['descripcion'];
        $creador_id = $data['creador_id'];
        $fecha_inicio = $data['fecha_inicio'];
        $cupo = $data['cupo'];

        if ($cupo === null || $cupo === '') {
            $cupo = 30;
        }

        $sql = "SELECT fn_create_curso(:titulo, :descripcion, :creador_id, :fecha_inicio, :cupo) AS resultado";

        $pdo = $this->container->get('OMbase_datos'); // Usando tu contenedor

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'titulo' => $titulo,
            'descripcion' => $descripcion,
            'creador_id' => $creador_id,
            'fecha_inicio' => $fecha_inicio,
            'cupo' => $cupo,
        ]);

        $resultado = $stmt->fetchColumn();

        if ($resultado == 0) {
            return $this->respondWithJson($response, ['mensaje' => 'Curso creado correctamente'], 201);
        } elseif ($resultado == 1) {
            return $this->respondWithJson($response, ['error' => 'El creador del curso no existe'], 409);
        }
        return $this->respondWithJson($response, ['error' => 'Error desconocido'], 500);
    }

    public function read(Request $request, Response $response, $args)
    {
        $idCurso = $args['idCurso'];
        $sql = "CALL sp_get_curso(:id)";

        $pdo = $this->container->get('OMbase_datos');
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $idCurso]);

        $curso = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($curso && $curso['id'] !== null) {
            return $this->respondWithJson($response, $curso, 200);
        }

        return $this->respondWithJson($response, ['error' => 'Curso no encontrado'], 404);
    }

    public function update(Request $request, Response $response, $args)
    {
        $idCurso = $args['idCurso'];        
        $data = json_decode($request->getBody(), true);
        $titulo = $data['titulo'] ?? null;
        $descripcion = $data['descripcion'] ?? null;
        $creador_id = $data['creador_id'] ?? null;
        $fecha_inicio = $data['fecha_inicio'] ?? null;
        $cupo = $data['cupo'] ?? null;

        $sql = "SELECT fn_update_curso(:id, :titulo, :descripcion, :creador_id, :fecha_inicio, :cupo) AS resultado";

        $pdo = $this->container->get('OMbase_datos'); // Usando tu contenedor

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'id' => $idCurso,
            'titulo' => $titulo,
            'descripcion' => $descripcion,
            'creador_id' => $creador_id,
            'fecha_inicio' => $fecha_inicio,
            'cupo' => $cupo,
        ]);

        $resultado = $stmt->fetchColumn();

        if ($resultado == 0) {
            return $this->respondWithJson($response, ['mensaje' => 'Curso modificado correctamente'], 201);
        } elseif ($resultado == 1) {
            return $this->respondWithJson($response, ['error' => 'No se encontro el curso'], 409);
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


    private function respondWithJson(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}
