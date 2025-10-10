<?php
// api/manejar_asignaciones.php
include 'conexion.php';
header('Content-Type: application/json; charset=utf-8');

// Usar un bloque try-catch general para nunca dejar de enviar una respuesta JSON
try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['accion'])) {
        throw new Exception('Acción no especificada.', 400);
    }

    $accion = $data['accion'];

    switch ($accion) {
        case 'guardar':
            if (!isset($data['fecha'], $data['salon_id'], $data['horario_id'], $data['docente_id'], $data['asignatura_id'])) {
                throw new Exception('Datos incompletos para guardar.', 400);
            }
            $fecha = $data['fecha'];
            $salon_id = (int)$data['salon_id'];
            $horario_id = (int)$data['horario_id'];
            $docente_id = (int)$data['docente_id'];
            $asignatura_id = (int)$data['asignatura_id'];

            $sql = "INSERT INTO asignaciones (fecha, salon_id, horario_id, docente_id, asignatura_id) 
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                        docente_id = VALUES(docente_id), 
                        asignatura_id = VALUES(asignatura_id)";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("siiii", $fecha, $salon_id, $horario_id, $docente_id, $asignatura_id);

            if (!$stmt->execute()) {
                throw new Exception('Error al guardar la asignación: ' . $stmt->error, 500);
            }
            echo json_encode(['success' => true, 'message' => 'Asignación guardada con éxito.']);
            break;

        case 'quitar':
            if (!isset($data['fecha'], $data['salon_id'], $data['horario_id'])) {
                throw new Exception('Datos incompletos para quitar.', 400);
            }
            $fecha = $data['fecha'];
            $salon_id = (int)$data['salon_id'];
            $horario_id = (int)$data['horario_id'];
            
            $sql = "DELETE FROM asignaciones WHERE fecha = ? AND salon_id = ? AND horario_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sii", $fecha, $salon_id, $horario_id);

            if (!$stmt->execute()) {
                throw new Exception('Error al eliminar la asignación: ' . $stmt->error, 500);
            }
            echo json_encode(['success' => true, 'message' => 'Asignación eliminada con éxito.']);
            break;

        case 'guardar_semestre':
            if (!isset($data['fecha_base'], $data['semestre'], $data['config'])) {
                throw new Exception('Faltan datos para la asignación de semestre.', 400);
            }

            $fecha_base = $data['fecha_base'];
            $semestre = intval($data['semestre']);
            $config = $data['config'];
            $dia_semana_base = date('w', strtotime($fecha_base));

            $stmt_get = $conn->prepare("SELECT salon_id, horario_id, docente_id, asignatura_id FROM asignaciones WHERE fecha = ?");
            $stmt_get->bind_param("s", $fecha_base);
            $stmt_get->execute();
            $asignaciones_base = $stmt_get->get_result()->fetch_all(MYSQLI_ASSOC);
            $stmt_get->close();

            if (empty($asignaciones_base)) {
                echo json_encode(['success' => true, 'message' => 'No hay asignaciones en la fecha base para copiar.']);
                exit;
            }
            
            $fecha_inicio_str = ($semestre === 1) ? $config['semestre1_inicio'] : $config['semestre2_inicio'];
            $fecha_fin_str = ($semestre === 1) ? $config['semestre1_fin'] : $config['semestre2_fin'];

            $conn->begin_transaction();
            
            $stmt_insert = $conn->prepare(
                "INSERT INTO asignaciones (fecha, salon_id, horario_id, docente_id, asignatura_id) 
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE docente_id = VALUES(docente_id), asignatura_id = VALUES(asignatura_id)"
            );

            $fecha_actual = new DateTime($fecha_inicio_str);
            $fecha_fin = new DateTime($fecha_fin_str);

            while ($fecha_actual <= $fecha_fin) {
                if ((int)$fecha_actual->format('w') === (int)$dia_semana_base) {
                    $fecha_str = $fecha_actual->format('Y-m-d');
                    foreach ($asignaciones_base as $asig) {
                        $stmt_insert->bind_param("siiii", 
                            $fecha_str, $asig['salon_id'], $asig['horario_id'], 
                            $asig['docente_id'], $asig['asignatura_id']
                        );
                        if (!$stmt_insert->execute()) {
                            throw new Exception('Error replicando en fecha ' . $fecha_str);
                        }
                    }
                }
                $fecha_actual->modify('+1 day');
            }
            
            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'Asignación masiva completada con éxito.']);
            break;

        default:
            throw new Exception('Acción no reconocida.', 400);
            break;
    }

} catch (Exception $e) {
    if ($conn->in_transaction) {
        $conn->rollback();
    }
    http_response_code($e->getCode() > 0 ? $e->getCode() : 500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
?>