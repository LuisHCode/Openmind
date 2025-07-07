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
        $semanas_duracion = $data['semanas_duracion'];
        $categoria = $data['categoria'];
        $nivel = $data['nivel'];
        $cupo = $data['cupo'];
        $precio = $data['precio'] ?? 0.00;
        $imagen_url = $data['imagen_url'] ?? null;
        if ($imagen_url === null || $imagen_url === '') {
            $imagen_url = 'https://images.unsplash.com/photo-1669023414162-5bb06bbff0ec?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
        }
        if ($cupo === null || $cupo === '') {
            $cupo = 30;
        }
        if ($semanas_duracion === null || $semanas_duracion === '') {
            $semanas_duracion = 8;
        }

        $sql = "SELECT fn_create_curso(:titulo, :descripcion, :creador_id, :fecha_inicio, :semanas_duracion, :categoria, :nivel, :cupo, :precio, :imagen_url) AS resultado";

        $pdo = $this->container->get('OMbase_datos');
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'titulo' => $titulo,
            'descripcion' => $descripcion,
            'creador_id' => $creador_id,
            'fecha_inicio' => $fecha_inicio,
            'semanas_duracion' => $semanas_duracion,
            'categoria' => $categoria,
            'nivel' => $nivel,
            'cupo' => $cupo,
            'precio' => $precio,
            'imagen_url' => $imagen_url,
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
            // Asegurarse de que 'precio' esté presente y sea float
            $curso['precio'] = isset($curso['precio']) ? (float) $curso['precio'] : 0.0;
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
        $fecha_inicio = $data['fecha_inicio'] ?? null;
        $semanas_duracion = $data['semanas_duracion'] ?? null;
        $categoria = $data['categoria'] ?? null;
        $nivel = $data['nivel'] ?? null;
        $cupo = $data['cupo'] ?? null;
        $precio = $data['precio'] ?? null;
        $imagen_url = $data['imagen_url'] ?? null;
        if ($imagen_url === null || $imagen_url === '') {
            $imagen_url = 'https://images.unsplash.com/photo-1669023414162-5bb06bbff0ec?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
        }

        $sql = "SELECT fn_update_curso(:id, :titulo, :descripcion, :fecha_inicio, :semanas_duracion, :categoria, :nivel, :cupo, :precio, :imagen_url) AS resultado";

        $pdo = $this->container->get('OMbase_datos');
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'id' => $idCurso,
            'titulo' => $titulo,
            'descripcion' => $descripcion,
            'fecha_inicio' => $fecha_inicio,
            'semanas_duracion' => $semanas_duracion,
            'categoria' => $categoria,
            'nivel' => $nivel,
            'cupo' => $cupo,
            'precio' => $precio,
            'imagen_url' => $imagen_url,
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

    public function getAll(Request $request, Response $response, $args)
    {
        $sql = "CALL sp_get_todos_cursos()";
        $pdo = $this->container->get('OMbase_datos');
        $stmt = $pdo->query($sql);
        $cursos = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        // Asegurarse de que 'precio' esté presente y sea float en todos los cursos
        foreach ($cursos as &$curso) {
            $curso['precio'] = isset($curso['precio']) ? (float) $curso['precio'] : 0.0;
        }
        return $this->respondWithJson($response, $cursos, 200);
    }

    public function getMatriculados(Request $request, Response $response, $args)
    {
        $idCurso = $args['idCurso'];
        $sql = "CALL sp_get_matriculados_curso(:idCurso)";
        $pdo = $this->container->get('OMbase_datos');
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['idCurso' => $idCurso]);
        $matriculados = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        return $this->respondWithJson($response, $matriculados, 200);
    }

    public function getByCreador(Request $request, Response $response, $args)
    {
        $idCreador = $args['idCreador'];
        $sql = "CALL sp_get_cursos_por_creador(:idCreador)";
        $pdo = $this->container->get('OMbase_datos');
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['idCreador' => $idCreador]);
        $cursos = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        // Asegurarse de que 'precio' esté presente y sea float en todos los cursos
        foreach ($cursos as &$curso) {
            $curso['precio'] = isset($curso['precio']) ? (float) $curso['precio'] : 0.0;
        }
        return $this->respondWithJson($response, $cursos, 200);
    }

    private function respondWithJson(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}
