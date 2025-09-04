<?php
include 'conexion.php';
header('Content-Type: application/json; charset=utf-8');

$data = json_decode(file_get_contents('php://input'), true);

// Validar que los datos necesarios están presentes
if (!isset($data['nombre'], $data['asignatura'], $data['anio'])) {
    http_response_code(400);
    echo json_encode(['error' => true, 'mensaje' => 'Datos incompletos.']);
    exit;
}

// Separar nombre y apellido (asumimos el primer nombre y el resto como apellido)
$nombreCompleto = explode(' ', trim($data['nombre']), 2);
$nombre = $nombreCompleto[0];
$apellido = $nombreCompleto[1] ?? ''; // Si no hay apellido, se guarda vacío

$asignatura = $data['asignatura'];
$ano_cursado = (int)$data['anio'];

$response = ['error' => true, 'mensaje' => 'Error desconocido.'];

$stmt = $conn->prepare("INSERT INTO docentes (nombre, apellido, asignatura, ano_cursado) VALUES (?, ?, ?, ?)");
$stmt->bind_param("sssi", $nombre, $apellido, $asignatura, $ano_cursado);

if ($stmt->execute()) {
    $nuevo_id = $conn->insert_id;
    // Devolvemos el objeto profesor completo como lo espera el frontend
    $response = [
        'error' => false,
        'profesor' => [
            'id' => $nuevo_id,
            'nombre' => $nombre,
            'apellido' => $apellido,
            'nombre_completo' => trim($data['nombre']),
            'asignatura' => $asignatura,
            'ano_cursado' => $ano_cursado
        ]
    ];
} else {
    http_response_code(500);
    $response['mensaje'] = 'Error al agregar el profesor: ' . $stmt->error;
}
$stmt->close();


echo json_encode($response);
$conn->close();
?>