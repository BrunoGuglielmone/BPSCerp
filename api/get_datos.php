<?php
// api/get_datos.php
include 'conexion.php';
header('Content-Type: application/json; charset=utf-8');

$fecha = $_GET['fecha'] ?? date('Y-m-d');
$response = [];

try {
    // 1. Obtener Salones
    $response['salones'] = $conn->query("SELECT id, nombre FROM salones ORDER BY nombre ASC")->fetch_all(MYSQLI_ASSOC);

    // 2. Obtener Horarios
    $response['horarios'] = $conn->query("SELECT id, hora FROM horarios ORDER BY id ASC")->fetch_all(MYSQLI_ASSOC);

    // 3. Obtener TODAS las asignaturas (para el modal)
    $response['asignaturas'] = $conn->query("SELECT id, nombre FROM asignaturas ORDER BY nombre ASC")->fetch_all(MYSQLI_ASSOC);
    
    // 4. Obtener Asignaciones para la fecha específica (con JOINs)
    // MODIFICADO: Se añade LEFT JOIN a carrera_asignatura para obtener el año.
    $sql_asig = "SELECT 
                    ag.salon_id,
                    ag.horario_id,
                    ag.docente_id,
                    ag.asignatura_id,
                    CONCAT(d.nombre, ' ', d.apellido) as docente_nombre,
                    a.nombre as asignatura_nombre,
                    ca.ano_cursado 
                FROM asignaciones ag
                JOIN docentes d ON ag.docente_id = d.id
                JOIN asignaturas a ON ag.asignatura_id = a.id
                LEFT JOIN carrera_asignatura ca ON ag.asignatura_id = ca.asignatura_id 
                WHERE ag.fecha = ?
                GROUP BY ag.salon_id, ag.horario_id"; 
    
    $stmt = $conn->prepare($sql_asig);
    $stmt->bind_param("s", $fecha);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    $asignaciones_procesadas = [];
    while ($row = $resultado->fetch_assoc()) {
        $key = $row['salon_id'] . '-' . $row['horario_id'];
        $asignaciones_procesadas[$key] = $row;
    }
    $response['asignaciones'] = $asignaciones_procesadas;

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => 'Error al obtener datos: ' . $e->getMessage()]);
}

$conn->close();
?>