<?php
include 'conexion.php';

// Establecer la cabecera para devolver respuestas en formato JSON
header('Content-Type: application/json; charset=utf-8');

// Leer los datos JSON enviados desde el frontend
$data = json_decode(file_get_contents('php://input'), true);

// Validar que la acción exista
if (!$data || !isset($data['accion'])) {
    http_response_code(400); 
    echo json_encode(['error' => true, 'mensaje' => 'Acción no especificada.']);
    exit;
}

$accion = $data['accion'];

if ($accion === 'guardar') {
    // --- LÓGICA PARA GUARDAR UNA ASIGNACIÓN ---
    if (!isset($data['fecha'], $data['salon_id'], $data['horario_id'], $data['profesor_id'])) {
        http_response_code(400);
        echo json_encode(['error' => true, 'mensaje' => 'Datos incompletos para guardar.']);
        exit;
    }
    $fecha = $data['fecha'];
    $salon_id = (int)$data['salon_id'];
    $horario_id = (int)$data['horario_id'];
    $profesor_id = (int)$data['profesor_id'];

    $sql = "
        INSERT INTO asignaciones (fecha, salon_id, horario_id, docente_id) 
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE docente_id = VALUES(docente_id)
    ";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("siii", $fecha, $salon_id, $horario_id, $profesor_id);

    if ($stmt->execute()) {
        echo json_encode(['error' => false, 'mensaje' => 'Asignación guardada con éxito.']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => true, 'mensaje' => 'Error al guardar la asignación: ' . $stmt->error]);
    }
    $stmt->close();

} elseif ($accion === 'quitar') {
    // --- LÓGICA PARA QUITAR UNA ASIGNACIÓN ---
    if (!isset($data['fecha'], $data['salon_id'], $data['horario_id'])) {
        http_response_code(400);
        echo json_encode(['error' => true, 'mensaje' => 'Datos incompletos para quitar.']);
        exit;
    }
    $fecha = $data['fecha'];
    $salon_id = (int)$data['salon_id'];
    $horario_id = (int)$data['horario_id'];
    
    $sql = "DELETE FROM asignaciones WHERE fecha = ? AND salon_id = ? AND horario_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sii", $fecha, $salon_id, $horario_id);

    if ($stmt->execute()) {
        echo json_encode(['error' => false, 'mensaje' => 'Asignación eliminada con éxito.']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => true, 'mensaje' => 'Error al eliminar la asignación: ' . $stmt->error]);
    }
    $stmt->close();

} elseif ($accion === 'guardar_semestre') {
    // LÓGICA PARA ASIGNACIÓN MASIVA POR SEMESTRE ---
    if (!isset($data['fecha_base'], $data['semestre'])) {
        http_response_code(400);
        echo json_encode(['error' => true, 'mensaje' => 'Faltan datos para la asignación de semestre.']);
        exit;
    }

    $fecha_base = $data['fecha_base'];
    $semestre = intval($data['semestre']);
    $current_year = date('Y', strtotime($fecha_base));

    // 1. Obtener el día de la semana de la fecha base (0=Domingo, 1=Lunes...)
    $dia_semana_base = date('w', strtotime($fecha_base));

    // 2. Obtener todas las asignaciones de la fecha base
    $stmt_get = $conn->prepare("SELECT salon_id, horario_id, docente_id FROM asignaciones WHERE fecha = ?");
    $stmt_get->bind_param("s", $fecha_base);
    $stmt_get->execute();
    $resultado = $stmt_get->get_result();
    $asignaciones_base = $resultado->fetch_all(MYSQLI_ASSOC);
    $stmt_get->close();

    if (empty($asignaciones_base)) {
        echo json_encode(['error' => true, 'mensaje' => 'No hay asignaciones en la fecha base para copiar.']);
        exit;
    }

    // 3. Determinar las fechas de inicio y fin del semestre
    //  DateTime para manejar las fechas de forma segura
    try {
        if ($semestre === 1) {
            $fecha_inicio = new DateTime("$current_year-03-01");
            $fecha_fin = new DateTime("$current_year-07-27");
        } else {
            $fecha_inicio = new DateTime("$current_year-07-28");
            // Puedes ajustar esta fecha de fin si es necesario
            $fecha_fin = new DateTime("$current_year-12-15"); 
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => true, 'mensaje' => 'Error al crear las fechas del semestre.']);
        exit;
    }
    
    // Iniciar transacción
    $conn->begin_transaction();

    try {
        // 4. Preparar la consulta de inserción/actualización
        $stmt_insert = $conn->prepare(
            "INSERT INTO asignaciones (fecha, salon_id, horario_id, docente_id) 
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE docente_id = VALUES(docente_id)"
        );

        // 5. Iterar por cada día del semestre
        $intervalo = new DateInterval('P1D');
        $periodo = new DatePeriod($fecha_inicio, $intervalo, $fecha_fin->modify('+1 day'));

        foreach ($periodo as $dia) {
            // Si el día de la semana coincide, hacemos la copia
            if ((int)$dia->format('w') === (int)$dia_semana_base) {
                $fecha_actual = $dia->format('Y-m-d');
                // Ignoramos la fecha base para no duplicar
                if ($fecha_actual === $fecha_base) continue;

                foreach ($asignaciones_base as $asig) {
                    $stmt_insert->bind_param("siii", 
                        $fecha_actual, 
                        $asig['salon_id'], 
                        $asig['horario_id'], 
                        $asig['docente_id']
                    );
                    if (!$stmt_insert->execute()) {
                        // Si falla una inserción, lanzamos una excepción para revertir todo
                        throw new Exception("Error al insertar en la fecha $fecha_actual: " . $stmt_insert->error);
                    }
                }
            }
        }
        $stmt_insert->close();

        // Si todo fue bien, confirmamos los cambios
        $conn->commit();
        echo json_encode(['error' => false, 'mensaje' => 'Asignación masiva completada con éxito.']);

    } catch (Exception $e) {
        // Si algo falló, revertimos todos los cambios
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['error' => true, 'mensaje' => 'Error durante la transacción: ' . $e->getMessage()]);
    }

} else {
    // --- ACCIÓN NO VÁLIDA ---
    http_response_code(400);
    echo json_encode(['error' => true, 'mensaje' => 'Acción no reconocida.']);
}

// Cerrar la conexión
$conn->close();
?>