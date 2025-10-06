<?php
include_once 'conexion.php';
header('Content-Type: application/json; charset=utf-8');
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    case 'GET':
        $stmt = $conn->prepare("SELECT id, nombre FROM asignaturas ORDER BY nombre ASC");
        $stmt->execute();
        $resultado = $stmt->get_result();
        echo json_encode($resultado->fetch_all(MYSQLI_ASSOC));
        break;

    case 'POST':
        if (!isset($_POST['nombre'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos."]);
            exit;
        }
        $nombre = $_POST['nombre'];
        $id = $_POST['asignatura_id'] ?? null;

        try {
            if ($id) {
                $stmt = $conn->prepare("UPDATE asignaturas SET nombre = ? WHERE id = ?");
                $stmt->bind_param("si", $nombre, $id);
                $mensaje = "Asignatura actualizada.";
            } else {
                $stmt = $conn->prepare("INSERT INTO asignaturas (nombre) VALUES (?)");
                $stmt->bind_param("s", $nombre);
                $mensaje = "Asignatura registrada.";
            }
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => $mensaje]);
            } else {
                throw new Exception($stmt->error);
            }
        } catch (Exception $e) {
            http_response_code(500);
            // Código '1062' es para entrada duplicada en MySQL
            if (strpos($e->getMessage(), '1062') !== false) {
                 echo json_encode(["success" => false, "message" => "Error: Ya existe una asignatura con ese nombre."]);
            } else {
                 echo json_encode(["success" => false, "message" => "Error al guardar: " . $e->getMessage()]);
            }
        }
        break;

    case 'DELETE':
        $datos = json_decode(file_get_contents('php://input'), true);
        if (empty($datos['ids'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "No se proporcionaron IDs."]);
            exit;
        }
        $ids = $datos['ids'];
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $tipos = str_repeat('i', count($ids));
        
        $stmt = $conn->prepare("DELETE FROM asignaturas WHERE id IN ($placeholders)");
        $stmt->bind_param($tipos, ...$ids);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Asignatura(s) eliminada(s)."]);
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