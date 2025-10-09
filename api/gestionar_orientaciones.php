<?php
include_once 'conexion.php';
header('Content-Type: application/json; charset=utf-8');
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    case 'GET':
        // Se añade `c.ano` a la consulta y los joins para los docentes
        $sql = "SELECT 
                    c.id, c.nombre, c.color, c.ano,
                    GROUP_CONCAT(DISTINCT a.id SEPARATOR ',') AS asignaturas_ids,
                    GROUP_CONCAT(DISTINCT a.nombre SEPARATOR '||') AS asignaturas_nombres,
                    GROUP_CONCAT(DISTINCT d.id SEPARATOR ',') AS docentes_ids,
                    GROUP_CONCAT(DISTINCT CONCAT(d.nombre, ' ', d.apellido) SEPARATOR '||') AS docentes_nombres
                FROM 
                    carreras c
                LEFT JOIN 
                    carrera_asignatura ca ON c.id = ca.carrera_id
                LEFT JOIN 
                    asignaturas a ON ca.asignatura_id = a.id
                LEFT JOIN 
                    docente_carrera dc ON c.id = dc.carrera_id
                LEFT JOIN 
                    docentes d ON dc.docente_id = d.id
                GROUP BY 
                    c.id, c.nombre, c.color, c.ano
                ORDER BY
                    c.ano ASC, c.nombre ASC";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $resultado = $stmt->get_result();
        $carreras = $resultado->fetch_all(MYSQLI_ASSOC);

        // Procesar los resultados para anidar los datos en arrays
        foreach ($carreras as $key => $carrera) {
            // Procesar asignaturas
            $carreras[$key]['asignaturas'] = [];
            if ($carrera['asignaturas_ids'] && $carrera['asignaturas_nombres']) {
                 $ids = explode(',', $carrera['asignaturas_ids']);
                 $nombres = explode('||', $carrera['asignaturas_nombres']);
                 for($i = 0; $i < count($ids); $i++) {
                     if (isset($nombres[$i])) { // Asegurarse de que el índice existe
                        $carreras[$key]['asignaturas'][] = ['id' => $ids[$i], 'nombre' => $nombres[$i]];
                     }
                 }
            }
            
            // Procesar docentes
            $carreras[$key]['docentes'] = [];
             if ($carrera['docentes_ids'] && $carrera['docentes_nombres']) {
                 $ids = explode(',', $carrera['docentes_ids']);
                 $nombres = explode('||', $carrera['docentes_nombres']);
                 for($i = 0; $i < count($ids); $i++) {
                     if (isset($nombres[$i])) { // Asegurarse de que el índice existe
                        $carreras[$key]['docentes'][] = ['id' => $ids[$i], 'nombre' => $nombres[$i]];
                     }
                 }
            }
        }

        echo json_encode($carreras);
        break;

    case 'POST':
        // Validar que el nombre no esté vacío
        if (!isset($_POST['nombre']) || empty(trim($_POST['nombre']))) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "El nombre de la orientación es obligatorio."]);
            exit;
        }

        // Recoger todos los datos del formulario
        $nombre = trim($_POST['nombre']);
        $color = $_POST['color'] ?? '#4a90e2';
        $ano = $_POST['ano'] ?? 1;
        $id = $_POST['carrera_id'] ?? null;
        $asignaturas_ids = $_POST['asignaturas'] ?? [];
        $docentes_ids = $_POST['docentes'] ?? [];

        $conn->begin_transaction();
        try {
            if ($id) { // Si hay un ID, es una actualización
                $stmt = $conn->prepare("UPDATE carreras SET nombre = ?, color = ?, ano = ? WHERE id = ?");
                $stmt->bind_param("ssii", $nombre, $color, $ano, $id);
                $mensaje = "Orientación actualizada correctamente.";
                $carrera_id = $id;
            } else { // Si no hay ID, es una inserción
                $stmt = $conn->prepare("INSERT INTO carreras (nombre, color, ano) VALUES (?, ?, ?)");
                $stmt->bind_param("ssi", $nombre, $color, $ano);
                $mensaje = "Orientación creada correctamente.";
            }

            if (!$stmt->execute()) throw new Exception($stmt->error);
            if (!$id) $carrera_id = $conn->insert_id; // Obtener el ID si es una nueva carrera

            // --- Gestionar asignaturas asociadas ---
            // 1. Borrar todas las relaciones existentes para esta carrera
            $stmt_delete_asig = $conn->prepare("DELETE FROM carrera_asignatura WHERE carrera_id = ?");
            $stmt_delete_asig->bind_param("i", $carrera_id);
            $stmt_delete_asig->execute();

            // 2. Insertar las nuevas relaciones seleccionadas
            if (!empty($asignaturas_ids)) {
                $stmt_insert_asig = $conn->prepare("INSERT INTO carrera_asignatura (carrera_id, asignatura_id) VALUES (?, ?)");
                foreach ($asignaturas_ids as $asignatura_id) {
                    $stmt_insert_asig->bind_param("ii", $carrera_id, $asignatura_id);
                    $stmt_insert_asig->execute();
                }
            }

            // --- Gestionar docentes asociados ---
            // 1. Borrar todas las relaciones existentes
            $stmt_delete_doc = $conn->prepare("DELETE FROM docente_carrera WHERE carrera_id = ?");
            $stmt_delete_doc->bind_param("i", $carrera_id);
            $stmt_delete_doc->execute();
            
            // 2. Insertar las nuevas relaciones
            if (!empty($docentes_ids)) {
                $stmt_insert_doc = $conn->prepare("INSERT INTO docente_carrera (carrera_id, docente_id) VALUES (?, ?)");
                foreach ($docentes_ids as $docente_id) {
                    $stmt_insert_doc->bind_param("ii", $carrera_id, $docente_id);
                    $stmt_insert_doc->execute();
                }
            }
            
            $conn->commit(); // Si todo fue bien, confirmar los cambios
            echo json_encode(["success" => true, "message" => $mensaje]);

        } catch (Exception $e) {
            $conn->rollback(); // Si algo falló, revertir todo
            http_response_code(500);
            // Manejar error de nombre duplicado
            if (strpos($e->getMessage(), '1062') !== false) {
                 echo json_encode(["success" => false, "message" => "Error: Ya existe una orientación con ese nombre."]);
            } else {
                 echo json_encode(["success" => false, "message" => "Error al guardar los datos: " . $e->getMessage()]);
            }
        }
        break;
    
    case 'DELETE':
        $datos = json_decode(file_get_contents('php://input'), true);
        if (empty($datos['id'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "No se proporcionó un ID para eliminar."]);
            exit;
        }
        $id = $datos['id'];
        
        // Se recomienda tener claves foráneas con ON DELETE CASCADE para que
        // al borrar una carrera, se borren sus relaciones en otras tablas.
        // Si no, este DELETE solo borrará la carrera principal.
        $stmt = $conn->prepare("DELETE FROM carreras WHERE id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Orientación eliminada correctamente."]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al eliminar la orientación."]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido."]);
        break;
}
$conn->close();
?>