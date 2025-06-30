CREATE DATABASE IF NOT EXISTS Openmind CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE Openmind;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(4096) NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cursos
CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    creador_id INT NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    cupo INT DEFAULT 30,
    FOREIGN KEY (creador_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de matrículas (relación muchos a muchos)
CREATE TABLE matriculas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    curso_id INT NOT NULL,
    fecha_matricula DATETIME DEFAULT CURRENT_TIMESTAMP,
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
        INSERT INTO usuarios(nombre, email, password) VALUES (p_nombre, p_email, p_password);
    END IF;
    RETURN existe;
END $$

CREATE FUNCTION fn_get_usuario(p_id INT) 
RETURNS INT
NOT DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE encontrado INT DEFAULT 0;
    IF EXISTS (SELECT id FROM usuarios WHERE id = p_id) THEN
        SET encontrado = 1;
    END IF;
    RETURN encontrado;
END $$

-- Funciones con control de errores para cursos
CREATE FUNCTION fn_update_curso(p_id INT, p_titulo VARCHAR(150), p_descripcion TEXT, p_fecha_inicio DATETIME, p_fecha_fin DATETIME, p_cupo INT) 
RETURNS INT
NOT DETERMINISTIC
MODIFIES SQL DATA
BEGIN
    DECLARE not_found INT DEFAULT 0;
    IF NOT EXISTS (SELECT id FROM cursos WHERE id = p_id) THEN
        SET not_found = 1;
    ELSE
        UPDATE cursos
        SET titulo = p_titulo, descripcion = p_descripcion, fecha_inicio = p_fecha_inicio, fecha_fin = p_fecha_fin, cupo = p_cupo
        WHERE id = p_id;
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

CREATE FUNCTION fn_create_curso(p_titulo VARCHAR(150), p_descripcion TEXT, p_creador_id INT, p_fecha_inicio DATETIME, p_fecha_fin DATETIME, p_cupo INT) 
RETURNS INT
NOT DETERMINISTIC
MODIFIES SQL DATA
BEGIN
    DECLARE valido INT DEFAULT 0;
    IF EXISTS (SELECT id FROM usuarios WHERE id = p_creador_id) THEN
        INSERT INTO cursos(titulo, descripcion, creador_id, fecha_inicio, fecha_fin, cupo)
        VALUES (p_titulo, p_descripcion, p_creador_id, p_fecha_inicio, p_fecha_fin, p_cupo);
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
    ELSEIF EXISTS (SELECT id FROM matriculas WHERE usuario_id = p_usuario_id AND curso_id = p_curso_id) THEN
        SET error_flag = 2;
    ELSE
        INSERT INTO matriculas(usuario_id, curso_id) VALUES (p_usuario_id, p_curso_id);
    END IF;
    RETURN error_flag;
END $$

CREATE FUNCTION fn_get_matricula(p_usuario_id INT, p_curso_id INT) 
RETURNS INT
NOT DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE existe INT DEFAULT 0;
    IF EXISTS (SELECT id FROM matriculas WHERE usuario_id = p_usuario_id AND curso_id = p_curso_id) THEN
        SET existe = 1;
    END IF;
    RETURN existe;
END $$
DELIMITER ;
