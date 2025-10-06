<?php
// 1. INCLUIMOS LA CONEXIÓN Y OBTENEMOS LOS DATOS PARA LOS FILTROS
include_once __DIR__ . "/../api/conexion.php";
header_remove('Content-Type');

// --- Obtenemos los datos para poblar los desplegables de los filtros ---
$salones_list = $conn->query("SELECT id, nombre FROM salones ORDER BY id ASC")->fetch_all(MYSQLI_ASSOC);
$anios_list_res = $conn->query("SELECT DISTINCT ano_cursado FROM docentes WHERE ano_cursado IS NOT NULL ORDER BY ano_cursado ASC");
$anios_list = $anios_list_res->fetch_all(MYSQLI_ASSOC);

// 2. MANEJO DE FILTROS DESDE LA URL (GET)
$filtro_fecha = $_GET['fecha'] ?? date("Y-m-d"); // Default: hoy
$filtro_salon = $_GET['salon_id'] ?? '';
$filtro_anio = $_GET['ano_cursado'] ?? '';
$filtro_asignatura = $_GET['asignatura'] ?? '';
$filtro_semestre = $_GET['semestre'] ?? '';

// 3. CONSTRUCCIÓN DE LA CONSULTA SQL DINÁMICA (CORREGIDA)
$sql = "SELECT a.salon_id, a.horario_id, d.ano_cursado,
               CONCAT(d.nombre, ' ', d.apellido) AS docente, 
               asig.nombre AS asignatura_nombre -- CORREGIDO: Seleccionamos el nombre desde la tabla 'asignaturas'
        FROM asignaciones a
        JOIN docentes d ON a.docente_id = d.id
        LEFT JOIN asignaturas asig ON d.asignatura_id = asig.id -- CORREGIDO: Nos unimos a la tabla 'asignaturas'
        WHERE a.fecha = ?";
$params = ["s", $filtro_fecha];

if (!empty($filtro_salon)) {
    $sql .= " AND a.salon_id = ?";
    $params[0] .= "i";
    $params[] = $filtro_salon;
}
if (!empty($filtro_anio)) {
    $sql .= " AND d.ano_cursado = ?";
    $params[0] .= "i";
    $params[] = $filtro_anio;
}
if (!empty($filtro_asignatura)) {
    // CORREGIDO: El filtro de asignatura ahora busca en la tabla de asignaturas
    $sql .= " AND asig.nombre LIKE ?";
    $params[0] .= "s";
    $params[] = "%" . $filtro_asignatura . "%";
}

$stmt = $conn->prepare($sql);
if ($stmt) {
    $stmt->bind_param(...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    $asignaciones_filtradas = [];
    while ($row = $result->fetch_assoc()) {
        // CORREGIDO: Usamos la nueva columna 'asignatura_nombre'
        $asignaciones_filtradas[$row['salon_id']][$row['horario_id']] = '<div>' . htmlspecialchars($row['docente']) . '</div><div>' . htmlspecialchars($row['asignatura_nombre']) . ' (' . htmlspecialchars($row['ano_cursado']) . '°)</div>';
    }
    $stmt->close();
} else {
    die("Error en la consulta de asignaciones: " . $conn->error);
}

// --- Obtenemos todos los horarios (sin cambios) ---
$horarios_res = $conn->query("SELECT id, hora FROM horarios ORDER BY FIELD(hora, 7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,0)");
$horarios = $horarios_res->fetch_all(MYSQLI_ASSOC);

$conn->close();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ocupación de Salones - CERP Litoral</title>
    <link rel="stylesheet" href="../estilos/estilos.css">
    <link rel="stylesheet" href="../estilos/estilosalonarioexterno.css">
</head>
<body>

    <header class="page-header">
        <div class="logo-container">
            <img src="../imagenes/logo_cerp_3d.png" alt="Logo CERP">
        </div>
        <div class="header-controls">
            <span id="reloj" class="reloj"></span>
            <a href="../paginas/menuinteractivo.php" class="menu-button btn-animado">
                <span>Volver</span>
            </a>
        </div>
    </header>

    <main class="main-container">
        <form class="filters-container" method="GET" action="salonarioexterno.php">
            <div class="filter-group">
                <label for="fecha">Fecha:</label>
                <input type="date" id="fecha" name="fecha" value="<?php echo htmlspecialchars($filtro_fecha); ?>">
            </div>
            <div class="filter-group">
                <label for="semestre">Semestre:</label>
                <select id="semestre" name="semestre">
                    <option value="" <?php echo ($filtro_semestre == '') ? 'selected' : ''; ?>>Ambos</option>
                    <option value="1" <?php echo ($filtro_semestre == '1') ? 'selected' : ''; ?>>1er Semestre</option>
                    <option value="2" <?php echo ($filtro_semestre == '2') ? 'selected' : ''; ?>>2do Semestre</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="salon_id">Salón:</label>
                <select id="salon_id" name="salon_id">
                    <option value="">Todos</option>
                    <?php foreach ($salones_list as $salon): ?>
                        <option value="<?php echo $salon['id']; ?>" <?php echo ($filtro_salon == $salon['id']) ? 'selected' : ''; ?>>
                            <?php echo htmlspecialchars($salon['nombre']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="filter-group">
                <label for="ano_cursado">Año:</label>
                <select id="ano_cursado" name="ano_cursado">
                    <option value="">Todos</option>
                     <?php foreach ($anios_list as $anio): ?>
                        <option value="<?php echo $anio['ano_cursado']; ?>" <?php echo ($filtro_anio == $anio['ano_cursado']) ? 'selected' : ''; ?>>
                            <?php echo htmlspecialchars($anio['ano_cursado']); ?>°
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="filter-group">
                <label for="asignatura">Asignatura:</label>
                <input type="text" id="asignatura" name="asignatura" placeholder="Buscar..." value="<?php echo htmlspecialchars($filtro_asignatura); ?>">
            </div>
            <div class="filter-actions">
                <button type="submit" class="filter-button">Filtrar</button>
                <a href="salonarioexterno.php" class="filter-button clear">Limpiar</a>
            </div>
        </form>

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
                    <?php if (empty($salones_list)): ?>
                        <tr><td colspan="<?php echo count($horarios) + 1; ?>">No hay salones para mostrar.</td></tr>
                    <?php else: ?>
                        <?php foreach ($salones_list as $salon): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($salon['nombre']); ?></td>
                                <?php foreach ($horarios as $hora): ?>
                                    <?php
                                    $esOcupado = isset($asignaciones_filtradas[$salon['id']][$hora['id']]);
                                    $clase_css = $esOcupado ? 'ocupado' : 'libre';
                                    $contenido = $esOcupado ? $asignaciones_filtradas[$salon['id']][$hora['id']] : '';
                                    ?>
                                    <td class="<?php echo $clase_css; ?>"><?php echo $contenido; ?></td>
                                <?php endforeach; ?>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </section>
    </main>

    <script>
        const horasDB = <?php echo json_encode(array_column($horarios, 'hora')); ?>;
        const fechaMostrada = "<?php echo $filtro_fecha; ?>";
        const fechaHoy = "<?php echo date("Y-m-d"); ?>";
    </script>
    <script src="../js/salonarioexterno.js"></script>

</body>
</html>