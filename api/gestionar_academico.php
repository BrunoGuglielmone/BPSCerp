<?php
// api/gestionar_academico.php
include_once 'conexion.php';
header('Content-Type: application/json; charset=utf-8');

// Determinar la acción
$accion = $_GET['accion'] ?? '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $datos = json_decode(file_get_contents('php://input'), true);
    $accion = $datos['accion'] ?? 'default';
}

switch ($accion) {
    case 'listar_carreras':
        $sql = "SELECT id, nombre, color, ano, turno FROM carreras ORDER BY nombre";
        $result = $conn->query($sql);
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
        break;

    case 'guardar_carrera':
        $id = $datos['carrera_id'] ?? null;
        $nombre = $datos['nombre'] ?? '';
        $color = $datos['color'] ?? '#4a90e2';
        $ano = $datos['ano'] ?? 0;
        $turno = $datos['turno'] ?? 'Matutino'; 

        if (empty($nombre) || empty($ano)) {
            http_response_code(400); echo json_encode(['success' => false, 'message' => 'El nombre y la duración son obligatorios.']); exit;
        }

        $is_new = false; //  saber si es creación
        if ($id) {
            $stmt = $conn->prepare("UPDATE carreras SET nombre = ?, color = ?, ano = ?, turno = ? WHERE id = ?");
            $stmt->bind_param("ssisi", $nombre, $color, $ano, $turno, $id);
            $mensaje = 'Orientación actualizada.';
        } else {
            // Creación
            $is_new = true;
            $stmt = $conn->prepare("INSERT INTO carreras (nombre, color, ano, turno) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssis", $nombre, $color, $ano, $turno);
            $mensaje = 'Orientación creada.';
        }
        
        if ($stmt->execute()) {
            // Si fue una creación, obtenemos el nuevo ID. Si no, usamos el ID existente.
            $carrera_id = $is_new ? $conn->insert_id : $id;

            $carrera_guardada = [
                'id' => (int)$carrera_id, 
                'nombre' => $nombre,
                'color' => $color,
                'ano' => (int)$ano, 
                'turno' => $turno
            ];

            
            echo json_encode([
                'success' => true, 
                'message' => $mensaje,
                'carrera' => $carrera_guardada 
            ]);
        } else {
            http_response_code(500); echo json_encode(['success' => false, 'message' => 'Error al guardar: ' . $stmt->error]);
        }
        break;

        
    case 'obtener_plan_estudio':
        if (!isset($_GET['carrera_id'])) {
            http_response_code(400); echo json_encode(['success' => false, 'message' => 'Falta ID de carrera.']); exit;
        }
        $carrera_id = $_GET['carrera_id'];
        
        $sql = "SELECT ca.ano_cursado, a.id AS asignatura_id, a.nombre AS asignatura_nombre,
                       GROUP_CONCAT(DISTINCT d.id) AS docentes_ids,
                       GROUP_CONCAT(DISTINCT CONCAT(d.apellido, ', ', d.nombre) ORDER BY d.apellido) AS docentes_nombres
                FROM carrera_asignatura ca
                JOIN asignaturas a ON ca.asignatura_id = a.id
                LEFT JOIN docente_asignatura da ON a.id = da.asignatura_id AND da.ano_lectivo = YEAR(CURDATE())
                LEFT JOIN docentes d ON da.docente_id = d.id
                WHERE ca.carrera_id = ?
                GROUP BY ca.ano_cursado, a.id, a.nombre
                ORDER BY ca.ano_cursado, a.nombre";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $carrera_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $plan = [];
        while ($row = $result->fetch_assoc()) {
            $ano = $row['ano_cursado'];
            if (!isset($plan[$ano])) $plan[$ano] = [];
            $docentes = [];
            if ($row['docentes_ids']) {
                $ids = explode(',', $row['docentes_ids']);
                $nombres = explode(',', $row['docentes_nombres']);
                for($i=0; $i < count($ids); $i++) {
                    if (isset($ids[$i]) && isset($nombres[$i])) {
                        $docentes[] = ['id' => $ids[$i], 'nombre' => $nombres[$i]];
                    }
                }
            }
            $plan[$ano][] = ['asignatura_id' => $row['asignatura_id'], 'asignatura_nombre' => $row['asignatura_nombre'], 'docentes' => $docentes];
        }
        echo json_encode($plan);
        break;

    case 'listar_docentes_por_asignatura':
        if (!isset($_GET['asignatura_id'])) { http_response_code(400); exit; }
        $asignatura_id = $_GET['asignatura_id'];
        $ano_lectivo = date('Y');

        $sql = "SELECT d.id, CONCAT(d.apellido, ', ', d.nombre) as nombre_completo
                FROM docentes d
                JOIN docente_asignatura da ON d.id = da.docente_id
                WHERE da.asignatura_id = ? AND da.ano_lectivo = ?
                ORDER BY d.apellido, d.nombre";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $asignatura_id, $ano_lectivo);
        $stmt->execute();
        $result = $stmt->get_result();
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
        break;


    case 'eliminar_carrera':
        $id = $datos['carrera_id'];
        $stmt = $conn->prepare("DELETE FROM carreras WHERE id = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Orientación eliminada.']);
        } else {
            http_response_code(500); echo json_encode(['success' => false, 'message' => 'Error al eliminar.']);
        }
        break;

    case 'agregar_asignatura_a_plan':
        $carrera_id = $datos['carrera_id']; $asignatura_id = $datos['asignatura_id']; $ano_cursado = $datos['ano_cursado'];
        $stmt = $conn->prepare("INSERT IGNORE INTO carrera_asignatura (carrera_id, asignatura_id, ano_cursado) VALUES (?, ?, ?)");
        $stmt->bind_param("iii", $carrera_id, $asignatura_id, $ano_cursado);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Asignatura agregada al plan.']);
        } else {
            http_response_code(500); echo json_encode(['success' => false, 'message' => 'Error al agregar.']);
        }
        break;

    case 'quitar_asignatura_de_plan':
        $carrera_id = $datos['carrera_id']; $asignatura_id = $datos['asignatura_id'];
        $stmt = $conn->prepare("DELETE FROM carrera_asignatura WHERE carrera_id = ? AND asignatura_id = ?");
        $stmt->bind_param("ii", $carrera_id, $asignatura_id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Asignatura quitada del plan.']);
        } else {
            http_response_code(500); echo json_encode(['success' => false, 'message' => 'Error al quitar.']);
        }
        break;

    case 'actualizar_docentes_asignatura':
        $asignatura_id = $datos['asignatura_id'];
        $docente_ids = $datos['docente_ids'] ?? [];
        $ano_lectivo = date('Y');
        $conn->begin_transaction();
        try {
            $stmt_delete = $conn->prepare("DELETE FROM docente_asignatura WHERE asignatura_id = ? AND ano_lectivo = ?");
            $stmt_delete->bind_param("ii", $asignatura_id, $ano_lectivo);
            $stmt_delete->execute();
            if (!empty($docente_ids)) {
                $stmt_insert = $conn->prepare("INSERT INTO docente_asignatura (docente_id, asignatura_id, ano_lectivo) VALUES (?, ?, ?)");
                foreach ($docente_ids as $docente_id) {
                    $stmt_insert->bind_param("iii", $docente_id, $asignatura_id, $ano_lectivo);
                    $stmt_insert->execute();
                }
            }
            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'Docentes actualizados.']);
        } catch (Exception $e) {
            $conn->rollback();
            http_response_code(500); echo json_encode(['success' => false, 'message' => 'Error en la transacción: ' . $e->getMessage()]);
        }
    
        break;

    case 'limpiar_ano':
        if (!isset($datos['carrera_id'], $datos['ano_cursado'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Faltan datos para limpiar el año.']);
            exit;
        }
        $carrera_id = $datos['carrera_id'];
        $ano_cursado = $datos['ano_cursado'];

        $stmt = $conn->prepare("DELETE FROM carrera_asignatura WHERE carrera_id = ? AND ano_cursado = ?");
        $stmt->bind_param("ii", $carrera_id, $ano_cursado);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Todas las asignaturas del año han sido eliminadas del plan.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al limpiar el año del plan de estudios.']);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Acción no válida o no especificada.']);
        break;
}
$conn->close();
?>

