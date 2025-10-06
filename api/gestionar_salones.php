<?php
// Incluimos el archivo de conexión a la base de datos.
include_once 'conexion.php';

// Establecemos que la respuesta será en formato JSON.
header('Content-Type: application/json; charset=utf-8');

// Obtenemos el método de la petición (GET, POST, DELETE).
$metodo = $_SERVER['REQUEST_METHOD'];

// Usamos una estructura switch para manejar cada tipo de petición.
switch ($metodo) {
    // CASO GET: Se usa para obtener los salones.
    case 'GET':
        try {
            $stmt = $conn->prepare("SELECT id, nombre, capacidad, tipo FROM salones ORDER BY nombre ASC");
            $stmt->execute();
            $resultado = $stmt->get_result();
            $salones = $resultado->fetch_all(MYSQLI_ASSOC);
            echo json_encode($salones);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al obtener salones: " . $e->getMessage()]);
        }
        break;

    // CASO POST: Se usa para crear un nuevo salón o actualizar uno existente.
    case 'POST':
        // Verificamos que los datos necesarios lleguen.
        if (!isset($_POST['nombre']) || !isset($_POST['capacidad'])) {
            http_response_code(400); // Bad Request
            echo json_encode(["success" => false, "message" => "Faltan datos requeridos."]);
            exit;
        }

        $nombre = $_POST['nombre'];
        $capacidad = $_POST['capacidad'];
        $tipo = $_POST['tipo'] ?? null; // Si el tipo no llega, se guarda como NULL.
        $id = $_POST['salon_id'] ?? null;

        try {
            // Si hay un ID, es una actualización.
            if ($id) {
                $stmt = $conn->prepare("UPDATE salones SET nombre = ?, capacidad = ?, tipo = ? WHERE id = ?");
                $stmt->bind_param("sisi", $nombre, $capacidad, $tipo, $id);
                $mensaje = "Salón actualizado con éxito.";
            } 
            // Si no hay ID, es una inserción.
            else {
                $stmt = $conn->prepare("INSERT INTO salones (nombre, capacidad, tipo) VALUES (?, ?, ?)");
                $stmt->bind_param("sis", $nombre, $capacidad, $tipo);
                $mensaje = "Salón registrado con éxito.";
            }

            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => $mensaje]);
            } else {
                throw new Exception("No se pudo ejecutar la consulta.");
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al guardar el salón: " . $e->getMessage()]);
        }
        break;

    // CASO DELETE: Se usa para eliminar uno o más salones.
    case 'DELETE':
        // Leemos el cuerpo de la petición, que viene en formato JSON.
        $datos = json_decode(file_get_contents('php://input'), true);
        
        if (empty($datos['ids']) || !is_array($datos['ids'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "No se proporcionaron IDs para eliminar."]);
            exit;
        }

        $ids = $datos['ids'];
        // Creamos una cadena de '?' para la consulta preparada (ej: ?,?,?).
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        // Creamos una cadena con los tipos de datos (ej: 'iii' para 3 IDs).
        $tipos = str_repeat('i', count($ids));

        try {
            $stmt = $conn->prepare("DELETE FROM salones WHERE id IN ($placeholders)");
            // Usamos ...$ids para pasar los elementos del array como argumentos individuales.
            $stmt->bind_param($tipos, ...$ids);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Salón(es) eliminado(s) correctamente."]);
            } else {
                throw new Exception("No se pudo ejecutar la eliminación.");
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al eliminar: " . $e->getMessage()]);
        }
        break;

    // Si el método no es GET, POST o DELETE.
    default:
        http_response_code(405); 
        echo json_encode(["success" => false, "message" => "Método no permitido."]);
        break;
}

// Cerramos la conexión a la base de datos.
$conn->close();
?>