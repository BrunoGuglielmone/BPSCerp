<?php
include 'conexion.php';
header('Content-Type: application/json; charset=utf-8');

// Obtener el método de la petición (GET, POST, etc.)
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo == 'POST') {
    // --- LÓGICA PARA GUARDAR/ACTUALIZAR LAS FECHAS ---

    // Obtener los datos enviados en el cuerpo de la petición
    $datos = json_decode(file_get_contents('php://input'), true);

    // Validar que los datos necesarios existen
    if (!isset($datos['inicioS1']) || !isset($datos['finS1']) || !isset($datos['inicioS2']) || !isset($datos['finS2'])) {
        http_response_code(400);
        echo json_encode(['error' => true, 'mensaje' => 'Faltan datos para guardar la configuración.']);
        exit;
    }

    // Preparar la consulta SQL para insertar o actualizar si la clave ya existe
    $sql = "INSERT INTO configuracion (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['error' => true, 'mensaje' => 'Error al preparar la consulta: ' . $conn->error]);
        exit;
    }

    $conn->begin_transaction(); // Iniciar transacción para asegurar que todo se guarde correctamente

    try {
        // Guardar cada una de las cuatro fechas
        $stmt->bind_param("ss", $clave, $valor);

        $clave = 'semestre1_inicio'; $valor = $datos['inicioS1']; $stmt->execute();
        $clave = 'semestre1_fin';    $valor = $datos['finS1'];    $stmt->execute();
        $clave = 'semestre2_inicio'; $valor = $datos['inicioS2']; $stmt->execute();
        $clave = 'semestre2_fin';    $valor = $datos['finS2'];    $stmt->execute();
        
        $conn->commit(); // Confirmar los cambios
        echo json_encode(['error' => false, 'mensaje' => 'Configuración de semestres guardada correctamente.']);

    } catch (mysqli_sql_exception $exception) {
        $conn->rollback(); // Revertir los cambios si algo falla
        http_response_code(500);
        echo json_encode(['error' => true, 'mensaje' => 'Error al guardar la configuración: ' . $exception->getMessage()]);
    }

    $stmt->close();

} else {
    // --- OBTENER LAS FECHAS  ---
    $sql = "SELECT clave, valor FROM configuracion WHERE clave LIKE 'semestre%'";
    $result = $conn->query($sql);
    
    $configuracion = [];
    while ($row = $result->fetch_assoc()) {
        // Crear un array asociativo como: ['semestre1_inicio' => '2025-03-10']
        $configuracion[$row['clave']] = $row['valor'];
    }
    
    echo json_encode($configuracion);
}

$conn->close();
?>