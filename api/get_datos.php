<?php
include 'conexion.php';
header('Content-Type: application/json; charset=utf-8');

$fecha = $_GET['fecha'] ?? date("Y-m-d");

// Array para la respuesta final
$response = [
    'salones' => [],
    'horarios' => [],
    'docentes' => [],
    'asignaciones' => [],
    'configuracion' => [] 
];

// 1. Obtener Salones
$resultSalones = $conn->query("SELECT id, nombre FROM salones ORDER BY id ASC");
while ($row = $resultSalones->fetch_assoc()) {
    $response['salones'][] = $row;
}

// 2. Obtener Horarios
$resultHorarios = $conn->query("SELECT id, hora FROM horarios ORDER BY hora ASC");
while ($row = $resultHorarios->fetch_assoc()) {
    $response['horarios'][] = $row;
}

// 3. Obtener Docentes
$sqlDocentes = "
    SELECT d.id, d.nombre, d.apellido, a.nombre AS asignatura, d.ano_cursado 
    FROM docentes d
    LEFT JOIN asignaturas a ON d.asignatura_id = a.id
    ORDER BY d.apellido ASC, d.nombre ASC
";
$resultDocentes = $conn->query($sqlDocentes);
while ($row = $resultDocentes->fetch_assoc()) {
    $row['nombre_completo'] = $row['nombre'] . ' ' . $row['apellido'];
    $response['docentes'][] = $row;
}

// 4. Obtener Asignaciones para la fecha
$sqlAsignaciones = "
    SELECT a.salon_id, a.horario_id, d.id AS docente_id,
           CONCAT(d.nombre, ' ', d.apellido) AS nombre,
           asig.nombre AS asignatura, d.ano_cursado AS anio
    FROM asignaciones a
    JOIN docentes d ON a.docente_id = d.id
    LEFT JOIN asignaturas asig ON d.asignatura_id = asig.id
    WHERE a.fecha = ?
";
$stmtAsignaciones = $conn->prepare($sqlAsignaciones);
$stmtAsignaciones->bind_param("s", $fecha);
$stmtAsignaciones->execute();
$resultAsignaciones = $stmtAsignaciones->get_result();
$asignacionesHoy = [];
while ($row = $resultAsignaciones->fetch_assoc()) {
    $key = $row['salon_id'] . '-' . $row['horario_id'];
    $asignacionesHoy[$key] = [
        'docente_id' => $row['docente_id'], 'nombre' => $row['nombre'],
        'asignatura' => $row['asignatura'], 'anio' => $row['anio']
    ];
}
$response['asignaciones'] = $asignacionesHoy;
$stmtAsignaciones->close();

// 5. NUEVO: Obtener la configuración de semestres
$resultConfig = $conn->query("SELECT clave, valor FROM configuracion WHERE clave LIKE 'semestre%'");
$configData = [];
while ($row = $resultConfig->fetch_assoc()) {
    $configData[$row['clave']] = $row['valor'];
}
$response['configuracion'] = $configData;

// Devolver todos los datos
echo json_encode($response);
$conn->close();
?>