<?php
// Incluir el archivo de conexión
include_once 'conexion.php';

// Establecer la cabecera para devolver respuestas en formato JSON
header('Content-Type: application/json; charset=utf-8');

// Obtener el método de la petición (GET, POST, DELETE, etc.)
$method = $_SERVER['REQUEST_METHOD'];

// Estructura de control para manejar diferentes métodos de petición
switch ($method) {
    // --- OBTENER TODOS LOS DOCENTES ---
    case 'GET':
        $result = $conn->query("SELECT id, nombre, apellido, asignatura, ano_cursado, cedula, telefono FROM docentes ORDER BY apellido ASC, nombre ASC");
        
        if (!$result) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al consultar la base de datos: " . $conn->error]);
            exit;
        }

        $docentes = [];
        while ($row = $result->fetch_assoc()) {
            $docentes[] = $row;
        }
        echo json_encode($docentes);
        break;

    // --- CREAR O ACTUALIZAR UN DOCENTE ---
    case 'POST':
        // Determinar si es una creación o una actualización
        $accion = $_GET['accion'] ?? 'crear';

        // Validar datos de entrada
        if (empty($_POST['nombre']) || empty($_POST['apellido']) || empty($_POST['asignatura']) || empty($_POST['ano_cursado'])) {
            http_response_code(400); // Bad Request
            echo json_encode(["success" => false, "message" => "Faltan campos obligatorios."]);
            exit;
        }

        if ($accion === 'crear') {
            $sql = "INSERT INTO docentes (nombre, apellido, asignatura, ano_cursado, cedula, telefono) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                 http_response_code(500);
                 echo json_encode(["success" => false, "message" => "Error al preparar la consulta: " . $conn->error]);
                 exit;
            }
            $stmt->bind_param(
                "ssisss", 
                $_POST['nombre'], 
                $_POST['apellido'], 
                $_POST['asignatura'], 
                $_POST['ano_cursado'], 
                $_POST['cedula'], 
                $_POST['telefono']
            );
        }

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Docente guardado correctamente."]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al guardar el docente: " . $stmt->error]);
        }
        $stmt->close();
        break;

    // --- ELIMINAR DOCENTES ---
    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['ids']) || !is_array($data['ids'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "No se proporcionaron IDs para eliminar."]);
            exit;
        }

        // Crear una cadena de placeholders (?, ?, ?) para la consulta
        $placeholders = implode(',', array_fill(0, count($data['ids']), '?'));
        $sql = "DELETE FROM docentes WHERE id IN ($placeholders)";
        $stmt = $conn->prepare($sql);
        
        // 'i' indica que cada ID es un entero
        $types = str_repeat('i', count($data['ids']));
        $stmt->bind_param($types, ...$data['ids']);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Docente(s) eliminado(s) correctamente."]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al eliminar: " . $stmt->error]);
        }
        $stmt->close();
        break;

    // --- MÉTODO NO SOPORTADO ---
    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(["success" => false, "message" => "Método no soportado."]);
        break;
}

// Cerrar la conexión
$conn->close();
?>