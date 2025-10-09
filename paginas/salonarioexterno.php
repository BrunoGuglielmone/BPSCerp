<?php
// 1. INCLUIMOS LA CONEXIÓN Y OBTENEMOS LOS DATOS PARA LOS FILTROS
include_once __DIR__ . "/../api/conexion.php";
header_remove('Content-Type');

// --- Obtenemos los datos para poblar los desplegables de los filtros ---
$salones_list = $conn->query("SELECT id, nombre FROM salones ORDER BY id ASC")->fetch_all(MYSQLI_ASSOC);
$anios_list_res = $conn->query("SELECT DISTINCT ano_cursado FROM docentes WHERE ano_cursado IS NOT NULL ORDER BY ano_cursado ASC");
$anios_list = $anios_list_res->fetch_all(MYSQLI_ASSOC);
$horarios_res = $conn->query("SELECT id, hora FROM horarios ORDER BY FIELD(hora, 7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,0)");
$horarios = $horarios_res->fetch_all(MYSQLI_ASSOC);


// 2. MANEJO DE VISTA Y FILTROS DESDE LA URL (GET)
$view = $_GET['view'] ?? 'diario'; // 'diario' o 'semanal'
$filtro_fecha = $_GET['fecha'] ?? date("Y-m-d");
$filtro_salon = $_GET['salon_id'] ?? '';
$filtro_anio = $_GET['ano_cursado'] ?? '';
$filtro_asignatura = $_GET['asignatura'] ?? '';
$filtro_semestre = $_GET['semestre'] ?? '';

// Preparamos los parámetros del GET para mantenerlos en los links del selector de vista
$get_params = $_GET;
unset($get_params['view']);
$query_string_filtros = http_build_query($get_params);


if ($view === 'semanal') {
    // --- LÓGICA PARA VISTA SEMANAL ---

    // Calcular inicio (Lunes) y fin (Sábado) de la semana
    $fecha_base = new DateTime($filtro_fecha);
    $dia_semana_num = $fecha_base->format('N'); // 1 (para Lunes) hasta 7 (para Domingo)
    $fecha_lunes = clone $fecha_base;
    $fecha_lunes->modify('-' . ($dia_semana_num - 1) . ' days');
    $fecha_sabado = clone $fecha_lunes;
    $fecha_sabado->modify('+5 days');

    $dias_semana = [];
    $fecha_iter = clone $fecha_lunes;
    while ($fecha_iter <= $fecha_sabado) {
        $dias_semana[] = $fecha_iter->format('Y-m-d');
        $fecha_iter->modify('+1 day');
    }
    
    setlocale(LC_TIME, 'es_ES.UTF-8', 'Spanish');


    $sql_semanal = "SELECT a.horario_id, a.fecha, 
                           CONCAT(d.nombre, ' ', d.apellido) AS docente, 
                           asig.nombre AS asignatura_nombre,
                           s.nombre AS salon_nombre,
                           d.ano_cursado
                    FROM asignaciones a
                    JOIN docentes d ON a.docente_id = d.id
                    LEFT JOIN asignaturas asig ON d.asignatura_id = asig.id
                    JOIN salones s ON a.salon_id = s.id
                    WHERE a.fecha BETWEEN ? AND ?";
    
    $params_semanal = ["ss", $fecha_lunes->format('Y-m-d'), $fecha_sabado->format('Y-m-d')];

    if (!empty($filtro_anio)) {
        $sql_semanal .= " AND d.ano_cursado = ?";
        $params_semanal[0] .= "i";
        $params_semanal[] = $filtro_anio;
    }
    if (!empty($filtro_asignatura)) {
        $sql_semanal .= " AND asig.nombre LIKE ?";
        $params_semanal[0] .= "s";
        $params_semanal[] = "%" . $filtro_asignatura . "%";
    }
    
    $sql_semanal .= " ORDER BY a.fecha, a.horario_id";

    $stmt_semanal = $conn->prepare($sql_semanal);
    $asignaciones_semanales = [];
    if ($stmt_semanal) {
        $stmt_semanal->bind_param(...$params_semanal);
        $stmt_semanal->execute();
        $result_semanal = $stmt_semanal->get_result();
        while ($row = $result_semanal->fetch_assoc()) {
            $asignaciones_semanales[$row['fecha']][$row['horario_id']][] = '<div>' . htmlspecialchars($row['salon_nombre']) . '</div><div class="info-secundaria">' . htmlspecialchars($row['docente']) . '</div><div class="info-secundaria">' . htmlspecialchars($row['asignatura_nombre']) . ' (' . htmlspecialchars($row['ano_cursado']) . '°)</div>';
        }
        $stmt_semanal->close();
    } else {
        die("Error en la consulta de asignaciones semanales: " . $conn->error);
    }

} else {
    // --- LÓGICA PARA VISTA DIARIA (CÓDIGO ORIGINAL) ---
    $sql = "SELECT a.salon_id, a.horario_id, d.ano_cursado,
                     CONCAT(d.nombre, ' ', d.apellido) AS docente, 
                     asig.nombre AS asignatura_nombre
              FROM asignaciones a
              JOIN docentes d ON a.docente_id = d.id
              LEFT JOIN asignaturas asig ON d.asignatura_id = asig.id
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
        $sql .= " AND asig.nombre LIKE ?";
        $params[0] .= "s";
        $params[] = "%" . $filtro_asignatura . "%";
    }

    $stmt = $conn->prepare($sql);
    $asignaciones_filtradas = [];
    if ($stmt) {
        $stmt->bind_param(...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $asignaciones_filtradas[$row['salon_id']][$row['horario_id']] = '<div>' . htmlspecialchars($row['docente']) . '</div><div>' . htmlspecialchars($row['asignatura_nombre']) . ' (' . htmlspecialchars($row['ano_cursado']) . '°)</div>';
        }
        $stmt->close();
    } else {
        die("Error en la consulta de asignaciones: " . $conn->error);
    }
}

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
            <input type="hidden" name="view" value="<?php echo htmlspecialchars($view); ?>">
            
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
            
            <?php if ($view === 'diario'): // Mostrar filtro de salón solo en vista diaria ?>
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
            <?php endif; ?>

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
                <a href="salonarioexterno.php?view=<?php echo $view; ?>" class="filter-button clear">Limpiar</a>
            </div>
        </form>

        <div class="view-switcher">
            <a href="?view=diario&<?php echo $query_string_filtros; ?>" class="<?php echo ($view === 'diario') ? 'active' : ''; ?>">Vista Diaria</a>
            <a href="?view=semanal&<?php echo $query_string_filtros; ?>" class="<?php echo ($view === 'semanal') ? 'active' : ''; ?>">Vista Semanal</a>
        </div>


        <section id="horarios" class="scroll-container">
            <?php if ($view === 'diario'): ?>
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
            <?php else: ?>
                <table id="tablaSemanal">
                     <thead>
                        <tr>
                            <th>Hora</th>
                            <?php foreach ($dias_semana as $fecha_dia): 
                                $fecha_obj = new DateTime($fecha_dia);
                                // Formato: "Lun 06/10"
                                $nombre_dia = strftime('%a', $fecha_obj->getTimestamp());
                                $fecha_corta = $fecha_obj->format('d/m');
                            ?>
                                <th><?php echo ucfirst($nombre_dia) . ' ' . $fecha_corta; ?></th>
                            <?php endforeach; ?>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($horarios as $hora): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($hora['hora']) . ':00'; ?></td>
                                <?php foreach ($dias_semana as $fecha_dia): ?>
                                    <?php
                                    $esOcupado = isset($asignaciones_semanales[$fecha_dia][$hora['id']]);
                                    $clase_css = $esOcupado ? 'ocupado' : 'libre';
                                    // Usamos implode para unir las posibles clases que caigan en el mismo horario
                                    $contenido = $esOcupado ? implode('<hr>', $asignaciones_semanales[$fecha_dia][$hora['id']]) : '';
                                    ?>
                                    <td class="<?php echo $clase_css; ?>"><?php echo $contenido; ?></td>
                                <?php endforeach; ?>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </section>
    </main>

    <script>
        const activeView = "<?php echo $view; ?>"; // Pasamos la vista activa a JS
        const horasDB = <?php echo json_encode(array_column($horarios, 'hora')); ?>;
        const fechaMostrada = "<?php echo $filtro_fecha; ?>";
        const fechaHoy = "<?php echo date("Y-m-d"); ?>";
    </script>
    <script src="../js/salonarioexterno.js"></script>

</body>
</html>