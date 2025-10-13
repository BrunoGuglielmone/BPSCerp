<?php
include_once 'conexion.php';
header('Content-Type: application/json; charset=utf-8');
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $sql = "SELECT d.id, d.nombre, d.apellido, d.ano_cursado, d.cedula, d.telefono, 
                       a.id AS asignatura_id, a.nombre AS asignatura_nombre,
                       GROUP_CONCAT(c.nombre SEPARATOR ', ') AS carreras_nombres,
                       GROUP_CONCAT(c.id SEPARATOR ',') AS carreras_ids
                FROM docentes d
                LEFT JOIN asignaturas a ON d.asignatura_id = a.id
                LEFT JOIN docente_carrera dc ON d.id = dc.docente_id
                LEFT JOIN carreras c ON dc.carrera_id = c.id
                GROUP BY d.id
                ORDER BY d.apellido ASC, d.nombre ASC";
        $result = $conn->query($sql);
        if (!$result) {
            http_response_code(500);
            echo json_encode(["message" => "Error al consultar la base de datos: " . $conn->error]);
        } else {
            echo json_encode($result->fetch_all(MYSQLI_ASSOC));
        }
        exit;

    case 'POST':
        if (empty($_POST['nombre']) || empty($_POST['apellido']) || empty($_POST['asignatura_id']) || empty($_POST['ano_cursado']) || empty($_POST['cedula'])) {
            http_response_code(400); $response["message"] = "Faltan campos obligatorios."; break;
        }

        $nombre = $_POST['nombre'];
        $apellido = $_POST['apellido'];
        $asignatura_id = (int)$_POST['asignatura_id'];
        $ano_cursado = (int)$_POST['ano_cursado'];
        $cedula = preg_replace('/[.\-]/', '', $_POST['cedula']);
        $telefono = $_POST['telefono'] ?? null;
        $carreras = $_POST['carreras'] ?? [];
        $id = isset($_POST['docente_id']) && !empty($_POST['docente_id']) ? (int)$_POST['docente_id'] : null;

        $stmt_check_ci = $conn->prepare("SELECT id FROM docentes WHERE cedula = ? AND id != ?");
        $id_check = $id ?? 0;
        $stmt_check_ci->bind_param("si", $cedula, $id_check);
        $stmt_check_ci->execute();
        if ($stmt_check_ci->get_result()->num_rows > 0) {
            http_response_code(409); $response["message"] = "Error: La cédula ya pertenece a otro docente."; break;
        }

        $conn->begin_transaction();
        try {
            if ($id) {
                $sql = "UPDATE docentes SET nombre=?, apellido=?, asignatura_id=?, ano_cursado=?, cedula=?, telefono=? WHERE id=?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ssiissi", $nombre, $apellido, $asignatura_id, $ano_cursado, $cedula, $telefono, $id);
                $docente_id = $id;
                $action_message = "Docente actualizado.";
            } else {
                $sql = "INSERT INTO docentes (nombre, apellido, asignatura_id, ano_cursado, cedula, telefono) VALUES (?, ?, ?, ?, ?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ssiiss", $nombre, $apellido, $asignatura_id, $ano_cursado, $cedula, $telefono);
            }
            $stmt->execute();
            if (!$id) $docente_id = $conn->insert_id;
            
            $stmt_delete_carreras = $conn->prepare("DELETE FROM docente_carrera WHERE docente_id = ?");
            $stmt_delete_carreras->bind_param("i", $docente_id);
            $stmt_delete_carreras->execute();

            if (!empty($carreras)) {
                $stmt_insert_carrera = $conn->prepare("INSERT INTO docente_carrera (docente_id, carrera_id) VALUES (?, ?)");
                foreach ($carreras as $carrera_id) {
                    $stmt_insert_carrera->bind_param("ii", $docente_id, $carrera_id);
                    $stmt_insert_carrera->execute();
                }
            }
            
            $conn->commit();
            $response = ["success" => true, "message" => $action_message ?? "Docente guardado."];

        } catch (Exception $e) {
            $conn->rollback();
            http_response_code(500);
            $response["message"] = "Error en la transacción: " . $e->getMessage();
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
        $response["message"] = "Método no soportado.";
        break;
}

$conn->close();
echo json_encode($response);
?>