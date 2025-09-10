<?php
// Incluir el archivo de conexión que ya tienes.
include_once 'conexion.php';

// Establecer la cabecera para devolver respuestas en formato JSON.
header('Content-Type: application/json; charset=utf-8');

// Obtener el método de la petición (GET, POST, DELETE).
$method = $_SERVER['REQUEST_METHOD'];
$response = ["success" => false, "message" => "Solicitud no válida."];

// Estructura de control para manejar diferentes métodos.
switch ($method) {
    // --- OBTENER TODOS LOS DOCENTES ---
    case 'GET':
        $result = $conn->query("SELECT id, nombre, apellido, asignatura, ano_cursado, cedula, telefono FROM docentes ORDER BY apellido ASC, nombre ASC");
        
        if (!$result) {
            http_response_code(500);
            $response["message"] = "Error al consultar la base de datos: " . $conn->error;
        } else {
            $docentes = [];
            while ($row = $result->fetch_assoc()) {
                $docentes[] = $row;
            }
            // Si la consulta es exitosa, la respuesta es el array de docentes.
            echo json_encode($docentes);
            exit; // Salir para no enviar el JSON de error de abajo.
        }
        break;

    // --- CREAR O ACTUALIZAR UN DOCENTE ---
    case 'POST':
        // Validar datos de entrada obligatorios.
        if (empty($_POST['nombre']) || empty($_POST['apellido']) || empty($_POST['asignatura']) || empty($_POST['ano_cursado'])) {
            http_response_code(400); // Bad Request
            $response["message"] = "Faltan campos obligatorios.";
            break;
        }

        // Sanitizar y asignar variables.
        $nombre = $_POST['nombre'];
        $apellido = $_POST['apellido'];
        $asignatura = $_POST['asignatura'];
        $ano_cursado = (int)$_POST['ano_cursado'];
        $cedula = $_POST['cedula'] ?? null;
        $telefono = $_POST['telefono'] ?? null;
        $id = isset($_POST['docente_id']) && !empty($_POST['docente_id']) ? (int)$_POST['docente_id'] : null;

        if ($id) {
            // --- LÓGICA DE ACTUALIZACIÓN ---
            $sql = "UPDATE docentes SET nombre = ?, apellido = ?, asignatura = ?, ano_cursado = ?, cedula = ?, telefono = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sssisss", $nombre, $apellido, $asignatura, $ano_cursado, $cedula, $telefono, $id);
            $action_message = "Docente actualizado correctamente.";
        } else {
            // --- LÓGICA DE CREACIÓN ---
            $sql = "INSERT INTO docentes (nombre, apellido, asignatura, ano_cursado, cedula, telefono) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sssiss", $nombre, $apellido, $asignatura, $ano_cursado, $cedula, $telefono);
            $action_message = "Docente guardado correctamente.";
        }
        
        if ($stmt->execute()) {
            $response = ["success" => true, "message" => $action_message];
        } else {
            http_response_code(500);
            $response["message"] = "Error al guardar el docente: " . $stmt->error;
        }
        $stmt->close();
        break;

    // --- ELIMINAR DOCENTES ---
    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['ids']) || !is_array($data['ids'])) {
            http_response_code(400);
            $response["message"] = "No se proporcionaron IDs para eliminar.";
            break;
        }

        $placeholders = implode(',', array_fill(0, count($data['ids']), '?'));
        $sql = "DELETE FROM docentes WHERE id IN ($placeholders)";
        $stmt = $conn->prepare($sql);
        
        $types = str_repeat('i', count($data['ids']));
        $stmt->bind_param($types, ...$data['ids']);

        if ($stmt->execute()) {
            $response = ["success" => true, "message" => "Docente(s) eliminado(s) correctamente."];
        } else {
            http_response_code(500);
            $response["message"] = "Error al eliminar: " . $stmt->error;
        }
        $stmt->close();
        break;

    // --- MÉTODO NO SOPORTADO ---
    default:
        http_response_code(405); // Method Not Allowed
        $response["message"] = "Método no soportado.";
        break;
}

// Cerrar la conexión y enviar la respuesta final en formato JSON.
$conn->close();
echo json_encode($response);
?>
