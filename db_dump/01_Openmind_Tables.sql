CREATE DATABASE IF NOT EXISTS Openmind CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE Openmind;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(4096) NOT NULL,
    fecha_creacion DATE
);

-- Tabla de cursos
CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion VARCHAR(500),
    creador_id INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    cupo INT NOT NULL DEFAULT 30,
    FOREIGN KEY (creador_id) REFERENCES usuarios(id) ON DELETE CASCADE
);


-- Tabla de matrículas (relación muchos a muchos)
CREATE TABLE matriculas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    curso_id INT NOT NULL,
    fecha_matricula DATE,
    UNIQUE KEY (usuario_id, curso_id), -- evita que se matricule dos veces al mismo curso
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
);

DELIMITER $$

CREATE PROCEDURE sp_get_usuario(IN p_id INT)
BEGIN
    IF EXISTS (SELECT id FROM usuarios WHERE id = p_id) THEN
        SELECT id, nombre, email, password
        FROM usuarios
        WHERE id = p_id;
    ELSE
        SELECT NULL AS id, NULL AS nombre, NULL AS email, NULL AS password;
    END IF;
END $$

CREATE PROCEDURE sp_get_curso(IN c_id INT)
BEGIN
    IF EXISTS (SELECT id FROM usuarios WHERE id = c_id) THEN
        SELECT c.id, c.titulo, c.descripcion, u.nombre, fecha_inicio, fecha_fin, cupo
        FROM cursos c
        JOIN usuarios u ON c.creador_id = u.id
        WHERE c.id = c_id;
    ELSE
        SELECT NULL AS id;
    END IF;
END $$

CREATE PROCEDURE sp_get_matricula(
    IN p_usuario_id INT,
    IN p_curso_id INT
)
BEGIN
    IF p_usuario_id IS NOT NULL AND p_curso_id IS NOT NULL THEN
        -- Ambos parámetros
        IF EXISTS (
            SELECT 1 FROM matriculas
            WHERE usuario_id = p_usuario_id AND curso_id = p_curso_id
        ) THEN
            SELECT m.id, u.nombre AS usuario, c.titulo AS curso, m.fecha_matricula
            FROM matriculas m
            JOIN usuarios u ON m.usuario_id = u.id
            JOIN cursos c ON m.curso_id = c.id
            WHERE m.usuario_id = p_usuario_id AND m.curso_id = p_curso_id;
        ELSE
            SELECT NULL AS id;
        END IF;

    ELSEIF p_usuario_id IS NOT NULL THEN
        -- Solo usuario
        IF EXISTS (
            SELECT 1 FROM matriculas WHERE usuario_id = p_usuario_id
        ) THEN
            SELECT m.id, u.nombre AS usuario, c.titulo AS curso, m.fecha_matricula
            FROM matriculas m
            JOIN usuarios u ON m.usuario_id = u.id
            JOIN cursos c ON m.curso_id = c.id
            WHERE m.usuario_id = p_usuario_id;
        ELSE
            SELECT NULL AS id;
        END IF;

    ELSEIF p_curso_id IS NOT NULL THEN
        -- Solo curso
        IF EXISTS (
            SELECT 1 FROM matriculas WHERE curso_id = p_curso_id
        ) THEN
            SELECT m.id, u.nombre AS usuario, c.titulo AS curso, m.fecha_matricula
            FROM matriculas m
            JOIN usuarios u ON m.usuario_id = u.id
            JOIN cursos c ON m.curso_id = c.id
            WHERE m.curso_id = p_curso_id;
        ELSE
            SELECT NULL AS id;
        END IF;

    ELSE
        -- Ningún parámetro
        SELECT NULL AS id;
    END IF;
END $$

-- Funciones con control de errores para usuarios
CREATE FUNCTION fn_update_usuario(p_id INT, p_nombre VARCHAR(100), p_email VARCHAR(100))
RETURNS INT
NOT DETERMINISTIC
MODIFIES SQL DATA
BEGIN
    DECLARE not_found INT DEFAULT 0;

    IF NOT EXISTS (SELECT id FROM usuarios WHERE id = p_id) THEN
        SET not_found = 1;
    ELSE
        IF p_nombre IS NOT NULL THEN
            UPDATE usuarios SET nombre = p_nombre WHERE id = p_id;
        END IF;

        IF p_email IS NOT NULL THEN
            UPDATE usuarios SET email = p_email WHERE id = p_id;
        END IF;
    END IF;

    RETURN not_found;
END $$


CREATE FUNCTION fn_delete_usuario(p_id INT) 
RETURNS INT
NOT DETERMINISTIC
MODIFIES SQL DATA
BEGIN
    DECLARE not_found INT DEFAULT 0;
    IF NOT EXISTS (SELECT id FROM usuarios WHERE id = p_id) THEN
        SET not_found = 1;
    ELSE
        DELETE FROM usuarios WHERE id = p_id;
    END IF;
    RETURN not_found;
END $$

CREATE FUNCTION fn_create_usuario(p_nombre VARCHAR(100), p_email VARCHAR(100), p_password VARCHAR(4096)) 
RETURNS INT
NOT DETERMINISTIC
MODIFIES SQL DATA
BEGIN
    DECLARE existe INT DEFAULT 0;
    IF EXISTS (SELECT id FROM usuarios WHERE email = p_email) THEN
        SET existe = 1;
    ELSE
        INSERT INTO usuarios(nombre, email, password, fecha_creacion) VALUES (p_nombre, p_email, p_password, NOW());
    END IF;
    RETURN existe;
END $$


-- Funciones con control de errores para cursos
CREATE FUNCTION fn_update_curso(
    p_id INT,
    p_titulo VARCHAR(150),
    p_descripcion TEXT,
    p_fecha_inicio DATE,
    p_fecha_fin DATE,
    p_cupo INT
)
RETURNS INT
NOT DETERMINISTIC
MODIFIES SQL DATA
BEGIN
    DECLARE not_found INT DEFAULT 0;

    IF NOT EXISTS (SELECT id FROM cursos WHERE id = p_id) THEN
        SET not_found = 1;
    ELSE
        IF p_titulo IS NOT NULL THEN
            UPDATE cursos SET titulo = p_titulo WHERE id = p_id;
        END IF;

        IF p_descripcion IS NOT NULL THEN
            UPDATE cursos SET descripcion = p_descripcion WHERE id = p_id;
        END IF;

        IF p_fecha_inicio IS NOT NULL THEN
            UPDATE cursos SET fecha_inicio = p_fecha_inicio WHERE id = p_id;
            UPDATE cursos SET fecha_final = DATE_ADD(p_fecha_inicio, INTERVAL 2 MONTH) WHERE id = p_id;
        END IF;

        IF p_cupo IS NOT NULL THEN
            UPDATE cursos SET cupo = p_cupo WHERE id = p_id;
        END IF;
    END IF;

    RETURN not_found;
END $$


CREATE FUNCTION fn_delete_curso(p_id INT) 
RETURNS INT
NOT DETERMINISTIC
MODIFIES SQL DATA
BEGIN
    DECLARE not_found INT DEFAULT 0;
    IF NOT EXISTS (SELECT id FROM cursos WHERE id = p_id) THEN
        SET not_found = 1;
    ELSE
        DELETE FROM cursos WHERE id = p_id;
    END IF;
    RETURN not_found;
END $$

CREATE FUNCTION fn_create_curso(
    p_titulo VARCHAR(150),
    p_descripcion VARCHAR(500),
    p_creador_id INT,
    p_fecha_inicio DATE,
    p_cupo INT
)
RETURNS INT
NOT DETERMINISTIC
MODIFIES SQL DATA
BEGIN
    DECLARE valido INT DEFAULT 0;
    DECLARE fecha_final DATE;

    IF EXISTS (SELECT id FROM usuarios WHERE id = p_creador_id) THEN
        SET fecha_final = DATE_ADD(p_fecha_inicio, INTERVAL 2 MONTH);

        INSERT INTO cursos(titulo, descripcion, creador_id, fecha_inicio, fecha_fin, cupo)
        VALUES (p_titulo, p_descripcion, p_creador_id, p_fecha_inicio, fecha_final, p_cupo);
    ELSE
        SET valido = 1;
    END IF;

    RETURN valido;
END $$

CREATE FUNCTION fn_get_curso(p_id INT) 
RETURNS INT
NOT DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE encontrado INT DEFAULT 0;
    IF EXISTS (SELECT id FROM cursos WHERE id = p_id) THEN
        SET encontrado = 1;
    END IF;
    RETURN encontrado;
END $$

-- Funciones con control de errores para matrículas
CREATE FUNCTION fn_delete_matricula(p_usuario_id INT, p_curso_id INT) 
RETURNS INT
NOT DETERMINISTIC
MODIFIES SQL DATA
BEGIN
    DECLARE not_found INT DEFAULT 0;
    IF NOT EXISTS (SELECT id FROM matriculas WHERE usuario_id = p_usuario_id AND curso_id = p_curso_id) THEN
        SET not_found = 1;
    ELSE
        DELETE FROM matriculas WHERE usuario_id = p_usuario_id AND curso_id = p_curso_id;
    END IF;
    RETURN not_found;
END $$

CREATE FUNCTION fn_create_matricula(p_usuario_id INT, p_curso_id INT) 
RETURNS INT
NOT DETERMINISTIC
MODIFIES SQL DATA
BEGIN
    DECLARE error_flag INT DEFAULT 0;
    IF NOT EXISTS (SELECT id FROM usuarios WHERE id = p_usuario_id) OR NOT EXISTS (SELECT id FROM cursos WHERE id = p_curso_id) THEN
        SET error_flag = 1;
    ELSEIF ((SELECT cupo FROM cursos WHERE id = p_curso_id) = 0) THEN
        SET error_flag = 4;
    ELSEIF EXISTS (SELECT id FROM matriculas WHERE usuario_id = p_usuario_id AND curso_id = p_curso_id) THEN
        SET error_flag = 2;
    ELSEIF EXISTS (SELECT id FROM cursos WHERE creador_id = p_usuario_id) THEN
        SET error_flag = 3;
    ELSE
        INSERT INTO matriculas(usuario_id, curso_id, fecha_matricula) VALUES (p_usuario_id, p_curso_id, NOW());
    END IF;
    RETURN error_flag;
END $$


CREATE FUNCTION fn_update_matricula(
    p_id INT,
    p_usuario_id INT,
    p_curso_id INT,
    p_fecha_matricula DATE
)
RETURNS INT
NOT DETERMINISTIC
MODIFIES SQL DATA
BEGIN
    DECLARE not_found INT DEFAULT 0;
    DECLARE v_curso_id INT;

    -- 1. Verificamos si la matrícula existe
    IF NOT EXISTS (SELECT id FROM matriculas WHERE id = p_id) THEN
        SET not_found = 1; -- matrícula no existe

    ELSE
        -- Obtenemos el curso actual si no se actualiza
        SET v_curso_id = (SELECT curso_id FROM matriculas WHERE id = p_id);

        -- 2. Validar curso nuevo (si viene)
        IF p_curso_id IS NOT NULL THEN
            IF NOT EXISTS (SELECT id FROM cursos WHERE id = p_curso_id) THEN
                SET not_found = 2; -- curso no existe
            ELSEIF (SELECT cupo FROM cursos WHERE id = p_curso_id) = 0 THEN
                SET not_found = 3; -- sin cupo
            ELSE
                UPDATE matriculas SET curso_id = p_curso_id WHERE id = p_id;
                SET v_curso_id = p_curso_id; -- actualizamos referencia del curso a usar en validación de creador
            END IF;
        END IF;

        -- 3. Validar usuario (si viene)
        IF p_usuario_id IS NOT NULL THEN
            IF NOT EXISTS (SELECT id FROM usuarios WHERE id = p_usuario_id) THEN
                SET not_found = 4; -- usuario no existe
            ELSEIF (SELECT creador_id FROM cursos WHERE id = v_curso_id) = p_usuario_id THEN
                SET not_found = 5; -- usuario es el creador del curso
            ELSE
                UPDATE matriculas SET usuario_id = p_usuario_id WHERE id = p_id;
            END IF;
        END IF;

        -- 4. Actualizar fecha si aplica
        IF p_fecha_matricula IS NOT NULL THEN
            UPDATE matriculas SET fecha_matricula = p_fecha_matricula WHERE id = p_id;
        END IF;
    END IF;

    RETURN not_found;
END $$

CREATE TRIGGER tr_matricula_restar_cupo
AFTER INSERT ON matriculas
FOR EACH ROW
BEGIN
    UPDATE cursos
    SET cupo = cupo - 1
    WHERE id = NEW.curso_id AND cupo > 0;
END $$

CREATE TRIGGER tr_update_matricula_cupo
BEFORE UPDATE ON matriculas
FOR EACH ROW
BEGIN
    -- Solo si el curso_id cambió
    IF NEW.curso_id <> OLD.curso_id THEN

        -- Validamos que el nuevo curso tenga cupo disponible
        IF (SELECT cupo FROM cursos WHERE id = NEW.curso_id) = 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El curso nuevo no tiene cupo disponible';
        END IF;

        -- Aumentar cupo al curso anterior
        UPDATE cursos
        SET cupo = cupo + 1
        WHERE id = OLD.curso_id;

        -- Disminuir cupo al curso nuevo
        UPDATE cursos
        SET cupo = cupo - 1
        WHERE id = NEW.curso_id;
    END IF;
END $$


DELIMITER ;
