<?php
include_once 'conexion.php';
header('Content-Type: application/json; charset=utf-8');
$metodo = $_SERVER['REQUEST_METHOD'];

// Este archivo es una copia casi idéntica de gestionar_asignaturas.php, solo cambian los nombres.
switch ($metodo) {
    case 'GET':
        $stmt = $conn->prepare("SELECT id, nombre FROM carreras ORDER BY nombre ASC");
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
        $id = $_POST['carrera_id'] ?? null;

        try {
            if ($id) {
                $stmt = $conn->prepare("UPDATE carreras SET nombre = ? WHERE id = ?");
                $stmt->bind_param("si", $nombre, $id);
                $mensaje = "Carrera actualizada.";
            } else {
                $stmt = $conn->prepare("INSERT INTO carreras (nombre) VALUES (?)");
                $stmt->bind_param("s", $nombre);
                $mensaje = "Carrera registrada.";
            }
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => $mensaje]);
            } else {
                throw new Exception($stmt->error);
            }
        } catch (Exception $e) {
            http_response_code(500);
            if (strpos($e->getMessage(), '1062') !== false) {
                 echo json_encode(["success" => false, "message" => "Error: Ya existe una carrera con ese nombre."]);
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
        
        $stmt = $conn->prepare("DELETE FROM carreras WHERE id IN ($placeholders)");
        $stmt->bind_param($tipos, ...$ids);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Carrera(s) eliminada(s)."]);
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