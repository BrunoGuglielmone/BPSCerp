<?php
// Incluir el archivo de conexión
include 'conexion.php';

// Establecer la cabecera para devolver respuestas en formato JSON
header('Content-Type: application/json; charset=utf-8');

// Leer los datos JSON enviados desde el frontend
$data = json_decode(file_get_contents('php://input'), true);

// Validar que los datos básicos existan
if (!$data || !isset($data['accion'], $data['fecha'], $data['salon_id'], $data['horario_id'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => true, 'mensaje' => 'Datos incompletos.']);
    exit;
}

$accion = $data['accion'];
$fecha = $data['fecha'];
$salon_id = (int)$data['salon_id'];
$horario_id = (int)$data['horario_id'];

if ($accion === 'guardar') {
    // --- LÓGICA PARA GUARDAR UNA ASIGNACIÓN ---
    if (!isset($data['profesor_id'])) {
        http_response_code(400);
        echo json_encode(['error' => true, 'mensaje' => 'Falta el ID del profesor.']);
        exit;
    }
    $profesor_id = (int)$data['profesor_id'];

    // Usamos INSERT ... ON DUPLICATE KEY UPDATE para manejar conflictos de forma segura.
    // Si ya existe una asignación en esa fecha/salón/hora, la actualiza. Si no, la inserta.
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

} else {
    // --- ACCIÓN NO VÁLIDA ---
    http_response_code(400);
    echo json_encode(['error' => true, 'mensaje' => 'Acción no reconocida.']);
}

// Cerrar la conexión
$conn->close();
?>