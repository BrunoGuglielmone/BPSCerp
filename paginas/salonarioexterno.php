<?php
// 1. INCLUIMOS LA CONEXIÓN A LA BASE DE DATOS
// Ruta corregida y único include necesario.
include_once __DIR__ . "/../api/conexion.php";

// Si la conexión falla, el script 'conexion.php' ya debería terminar con un error.

// Desactivamos cualquier cabecera JSON que 'conexion.php' pudiera haber establecido.
header_remove('Content-Type');

// 2. OBTENEMOS LOS DATOS DE LA BASE DE DATOS
$hoy = date("d/m/Y"); // Formato más legible para el usuario

// --- Obtenemos todos los salones ---
$salones_res = $conn->query("SELECT id, nombre FROM salones ORDER BY id ASC");
if (!$salones_res) {
    die("Error al obtener los salones: " . $conn->error);
}
$salones = $salones_res->fetch_all(MYSQLI_ASSOC);

// --- Obtenemos todos los horarios en el orden correcto ---
$horarios_res = $conn->query("SELECT id, hora FROM horarios ORDER BY FIELD(hora, 7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,0)");
if (!$horarios_res) {
    die("Error al obtener los horarios: " . $conn->error);
}
$horarios = $horarios_res->fetch_all(MYSQLI_ASSOC);

// --- Obtenemos las asignaciones de HOY ---
// Corregido: Usamos la tabla 'docentes' para ser consistentes con tu proyecto.
$asignaciones_hoy = [];
$sql = "SELECT a.salon_id, a.horario_id, 
               CONCAT(d.nombre, ' ', d.apellido) AS docente, 
               d.asignatura 
        FROM asignaciones a
        JOIN docentes d ON a.docente_id = d.id
        WHERE a.fecha = CURDATE()";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    die("Error al preparar la consulta de asignaciones: " . $conn->error);
}
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    // Creamos un array asociativo: [salon_id][horario_id] = "Docente - Asignatura"
    $asignaciones_hoy[$row['salon_id']][$row['horario_id']] = $row['docente'] . ' - ' . $row['asignatura'];
}

$stmt->close();
$conn->close();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ocupación de Salones - CERP Litoral</title>
    <link rel="stylesheet" href="../estilos/estilosalonarioexterno.css">
</head>
<body>

    <main class="main-container">
        <header class="info-header">
            <img src="../imagenes/logo_cerp_3d.png" alt="Logo CERP" class="logo">
            <h1>Ocupación de Salones</h1>
            <p>Fecha: <?php echo $hoy; ?></p>
        </header>

        <section id="horarios" class="scroll-container">
            <table id="tablaAulas">
                <thead>
                    <tr>
                        <th>Salón</th>
                        <?php foreach ($horarios as $hora): ?>
                            <th><?php echo htmlspecialchars($hora['hora']) . ':00'; ?></th>
                        <?php endforeach; ?>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($salones)): ?>
                        <tr>
                            <td colspan="<?php echo count($horarios) + 1; ?>">No hay salones para mostrar.</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($salones as $salon): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($salon['nombre']); ?></td>
                                <?php foreach ($horarios as $hora): ?>
                                    <?php
                                    $esOcupado = isset($asignaciones_hoy[$salon['id']][$hora['id']]);
                                    $clase_css = $esOcupado ? 'ocupado' : 'libre';
                                    $contenido = $esOcupado ? htmlspecialchars($asignaciones_hoy[$salon['id']][$hora['id']]) : '';
                                    ?>
                                    <td class="<?php echo $clase_css; ?>">
                                        <div><?php echo $contenido; ?></div>
                                    </td>
                                <?php endforeach; ?>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </section>
    </main>

    <script>
        // Pasamos el array de horas a JavaScript para que el script de scroll funcione
        const horasDB = <?php echo json_encode(array_column($horarios, 'hora')); ?>;
    </script>
    <script src="../js/salonarioexterno.js"></script>

</body>
</html>