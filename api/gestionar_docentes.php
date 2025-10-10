<?php
// api/gestionar_docentes.php
include_once 'conexion.php';
header('Content-Type: application/json; charset=utf-8');
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $sql = "SELECT id, nombre, apellido, cedula, telefono FROM docentes ORDER BY apellido ASC, nombre ASC";
        $result = $conn->query($sql);
        if (!$result) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al consultar la base de datos: " . $conn->error]);
        } else {
            echo json_encode($result->fetch_all(MYSQLI_ASSOC));
        }
        break;

    case 'POST':
        
        if (empty($_POST['nombre']) || empty($_POST['apellido']) || empty($_POST['cedula'])) {
            http_response_code(400); 
            echo json_encode(["success" => false, "message" => "Nombre, apellido y cédula son obligatorios."]);
            exit;
        }

        $nombre = $_POST['nombre'];
        $apellido = $_POST['apellido'];
        $cedula = preg_replace('/[^0-9]/', '', $_POST['cedula']);
        $telefono = preg_replace('/[^0-9]/', '', $_POST['telefono'] ?? '');
        $id = isset($_POST['docente_id']) && !empty($_POST['docente_id']) ? (int)$_POST['docente_id'] : null;

        
        try {
            if ($id) { // Actualizar
                $sql = "UPDATE docentes SET nombre=?, apellido=?, cedula=?, telefono=? WHERE id=?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ssssi", $nombre, $apellido, $cedula, $telefono, $id);
                $message = "Docente actualizado.";
            } else { // Crear
                $sql = "INSERT INTO docentes (nombre, apellido, cedula, telefono) VALUES (?, ?, ?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ssss", $nombre, $apellido, $cedula, $telefono);
                $message = "Docente guardado.";
            }
            
            if ($stmt->execute()) {
                 echo json_encode(["success" => true, "message" => $message]);
            } else {
                 throw new Exception($stmt->error);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error en la base de datos: " . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['ids']) || !is_array($data['ids'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "No se proporcionaron IDs."]);
            exit;
        }
        
        $placeholders = implode(',', array_fill(0, count($data['ids']), '?'));
        $sql = "DELETE FROM docentes WHERE id IN ($placeholders)";
        $stmt = $conn->prepare($sql);
        $types = str_repeat('i', count($data['ids']));
        $stmt->bind_param($types, ...$data['ids']);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Docente(s) eliminado(s)."]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al eliminar."]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido."]);
        break;
}

$conn->close();
?>