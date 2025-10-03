<?php
// Incluir el archivo de conexión a la base de datos
include 'conexion.php';

// Establecer la cabera para devolver respuestas en formato JSON
header('Content-Type: application/json; charset=utf-8');

// Obtener la fecha de la petición GET, si no se proporciona, usar la fecha actual
$fecha = $_GET['fecha'] ?? date("Y-m-d");

// Array para la respuesta final
$response = [
    'salones' => [],
    'horarios' => [],
    'docentes' => [],
    'asignaciones' => []
];

// 1. Obtener Salones (Sin cambios)
$resultSalones = $conn->query("SELECT id, nombre FROM salones ORDER BY id ASC");
while ($row = $resultSalones->fetch_assoc()) {
    $response['salones'][] = $row;
}

// 2. Obtener Horarios (Sin cambios)
$resultHorarios = $conn->query("SELECT id, hora FROM horarios ORDER BY hora ASC");
while ($row = $resultHorarios->fetch_assoc()) {
    $response['horarios'][] = $row;
}

// 3. Obtener Docentes (Consulta CORREGIDA)
$sqlDocentes = "
    SELECT d.id, d.nombre, d.apellido, a.nombre AS asignatura, d.ano_cursado 
    FROM docentes d
    LEFT JOIN asignaturas a ON d.asignatura_id = a.id
    ORDER BY d.apellido ASC, d.nombre ASC
";
$resultDocentes = $conn->query($sqlDocentes);
while ($row = $resultDocentes->fetch_assoc()) {
    // Combinamos nombre y apellido para facilitar su uso en el frontend
    $row['nombre_completo'] = $row['nombre'] . ' ' . $row['apellido'];
    $response['docentes'][] = $row;
}

// 4. Obtener Asignaciones para la fecha solicitada (Consulta CORREGIDA)
$sqlAsignaciones = "
    SELECT 
        a.salon_id, 
        a.horario_id, 
        d.id AS docente_id,
        CONCAT(d.nombre, ' ', d.apellido) AS nombre,
        asig.nombre AS asignatura, -- CORREGIDO: Obtiene el nombre desde la tabla 'asignaturas'
        d.ano_cursado AS anio
    FROM asignaciones a
    JOIN docentes d ON a.docente_id = d.id
    LEFT JOIN asignaturas asig ON d.asignatura_id = asig.id -- CORREGIDO: Se une a la tabla 'asignaturas'
    WHERE a.fecha = ?
";

$stmt = $conn->prepare($sqlAsignaciones);
$stmt->bind_param("s", $fecha);
$stmt->execute();
$resultAsignaciones = $stmt->get_result();

$asignacionesHoy = [];
while ($row = $resultAsignaciones->fetch_assoc()) {
    // Crear una clave única 'salon_id-horario_id' para que coincida con la lógica del frontend
    $key = $row['salon_id'] . '-' . $row['horario_id'];
    $asignacionesHoy[$key] = [
        'docente_id' => $row['docente_id'],
        'nombre'     => $row['nombre'],
        'asignatura' => $row['asignatura'],
        'anio'       => $row['anio']
    ];
}
$response['asignaciones'] = $asignacionesHoy;

// Devolver todos los datos como un único objeto JSON
echo json_encode($response);

// Cerrar la conexión
$stmt->close();
$conn->close();
?>