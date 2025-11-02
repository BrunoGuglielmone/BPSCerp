<?php

include_once __DIR__ . "/../api/conexion.php";
include_once __DIR__ . "/../api/verificar_sesion.php";
header_remove('Content-Type');

// OBTENCIÓN DE DATOS PARA LOS MENÚS DE FILTROS //
$salones_list = $conn->query("SELECT id, nombre FROM salones ORDER BY id ASC")->fetch_all(MYSQLI_ASSOC);
$anios_list_res = $conn->query("SELECT DISTINCT ano_cursado FROM carrera_asignatura WHERE ano_cursado IS NOT NULL ORDER BY ano_cursado ASC");
$anios_list = $anios_list_res->fetch_all(MYSQLI_ASSOC);
$horarios_res = $conn->query("SELECT id, hora FROM horarios ORDER BY id ASC");
$horarios = $horarios_res->fetch_all(MYSQLI_ASSOC); // <--- LISTA ÚNICA Y COMPLETA DE HORAS
$carreras_list = $conn->query("SELECT id, nombre FROM carreras ORDER BY nombre ASC")->fetch_all(MYSQLI_ASSOC);

// MANEJO DE PARÁMETROS DE ENTRADA (FILTROS) //
$view = $_GET['view'] ?? 'diario';
$filtro_fecha = $_GET['fecha'] ?? date("Y-m-d");
$filtro_salon = $_GET['salon_id'] ?? '';
$filtro_anio = $_GET['ano_cursado'] ?? '';
$filtro_semestre = $_GET['semestre'] ?? '';
$filtro_carrera = $_GET['carrera_id'] ?? '';

// Preparamos los parámetros para los enlaces de cambio de vista  //
$get_params = $_GET;
unset($get_params['view']);
$query_string_filtros = http_build_query($get_params);

// LÓDICA DE CONSULTA A LA BASE DE DATOS //
$asignaciones_filtradas = [];
$fecha_lunes = null;

// Partes de la consulta basadas en filtros 
$joins_carrera = "LEFT JOIN carrera_asignatura ca ON a.asignatura_id = ca.asignatura_id
                  LEFT JOIN carreras c ON ca.carrera_id = c.id";
                  
$sql_filter_joins = $joins_carrera;
$sql_filter_where = "";
$sql_filter_params = [""]; // Iniciar con el string de tipos

if (!empty($filtro_anio)) { 
    $sql_filter_where .= " AND ca.ano_cursado = ?"; 
    $sql_filter_params[0] .= "i"; 
    $sql_filter_params[] = $filtro_anio; 
}
if (!empty($filtro_carrera)) { 
    $sql_filter_where .= " AND c.id = ?"; 
    $sql_filter_params[0] .= "i"; 
    $sql_filter_params[] = $filtro_carrera; 
}

if ($view === 'semanal') {
    $fecha_base = new DateTime($filtro_fecha);
    $dia_semana_num = $fecha_base->format('N');
    $fecha_lunes = clone $fecha_base;
    $fecha_lunes->modify('-' . ($dia_semana_num - 1) . ' days');
    $fecha_sabado = clone $fecha_lunes;
    $fecha_sabado->modify('+5 days');
    $fecha_lunes_str = $fecha_lunes->format('Y-m-d');
    $fecha_sabado_str = $fecha_sabado->format('Y-m-d');

   
    

    // Consulta principal
    $sql = "SELECT a.salon_id, a.horario_id, a.fecha, CONCAT(d.nombre, ' ', d.apellido) AS docente, asig.nombre AS asignatura_nombre, ca.ano_cursado, s.nombre AS salon_nombre
            FROM asignaciones a
            JOIN docentes d ON a.docente_id = d.id
            JOIN asignaturas asig ON a.asignatura_id = asig.id
            JOIN salones s ON a.salon_id = s.id
            $sql_filter_joins
            WHERE a.fecha BETWEEN ? AND ?
            $sql_filter_where"; 
    
    $params = $sql_filter_params;
    array_splice($params, 1, 0, [$fecha_lunes_str, $fecha_sabado_str]);
    $params[0] = "ss" . $params[0];

} else { // Vista Diaria
    $sql = "SELECT a.salon_id, a.horario_id, CONCAT(d.nombre, ' ', d.apellido) AS docente, asig.nombre AS asignatura_nombre, ca.ano_cursado
            FROM asignaciones a
            JOIN docentes d ON a.docente_id = d.id
            JOIN asignaturas asig ON a.asignatura_id = asig.id
            $sql_filter_joins
            WHERE a.fecha = ?
            $sql_filter_where";
            
    $params = $sql_filter_params;
    array_splice($params, 1, 0, [$filtro_fecha]);
    $params[0] = "s" . $params[0];

    if (!empty($filtro_salon)) { 
        $sql .= " AND a.salon_id = ?"; 
        $params[0] .= "i"; 
        $params[] = $filtro_salon; 
    }
}

$sql .= " GROUP BY a.fecha, a.salon_id, a.horario_id";

// 5. EJECUCIÓN Y PROCESAMIENTO DE RESULTADOS
$stmt = $conn->prepare($sql);
if ($stmt) {
    $stmt->bind_param(...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        if ($view === 'semanal') {
            $key = $row['fecha'] . '-' . $row['horario_id'];
            $contenido_celda = '<div>' . htmlspecialchars($row['asignatura_nombre']) . ' (' . htmlspecialchars($row['ano_cursado'] ?? '?') . '°)</div>' . 
                                '<div>' . htmlspecialchars($row['docente']) . '</div>' .
                                '<div><i class="fa-solid fa-person-shelter" style="opacity: 0.8; margin-right: 5px;"></i>' . htmlspecialchars($row['salon_nombre']) . '</div>';
        } else { // Vista diaria
            $key = $row['salon_id'] . '-' . $row['horario_id'];
            $contenido_celda = '<div>' . htmlspecialchars($row['asignatura_nombre']) . ' (' . htmlspecialchars($row['ano_cursado'] ?? '?') . '°)</div>' . 
                                '<div>' . htmlspecialchars($row['docente']) . '</div>';
        }
        $asignaciones_filtradas[$key][] = $contenido_celda;
    }
    $stmt->close();
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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>
    <header class="page-header">
        <div class="logo-container"><img src="../imagenes/logo_cerp_3d.png" alt="Logo CERP"></div>
        <div class="header-controls">
            <span id="reloj" class="reloj"></span>
            <a href="../paginas/menuinteractivo.php" class="menu-button btn-animado"><span>Volver</span></a>
        </div>
    </header>

    <main class="main-container">
        <form class="filters-container" method="GET" action="salonarioexterno.php">
            <input type="hidden" name="view" value="<?php echo htmlspecialchars($view); ?>">
            <div class="filter-group"><label for="fecha">Fecha:</label><input type="date" id="fecha" name="fecha" value="<?php echo htmlspecialchars($filtro_fecha); ?>"></div>
            <div class="filter-group"><label for="semestre">Semestre:</label><select id="semestre" name="semestre"><option value="" <?php echo ($filtro_semestre == '') ? 'selected' : ''; ?>>Ambos</option><option value="1" <?php echo ($filtro_semestre == '1') ? 'selected' : ''; ?>>1er Semestre</option><option value="2" <?php echo ($filtro_semestre == '2') ? 'selected' : ''; ?>>2do Semestre</option></select></div>
            <?php if ($view === 'diario'): ?>
            <div class="filter-group"><label for="salon_id">Salón:</label><select id="salon_id" name="salon_id"><option value="">Todos</option><?php foreach ($salones_list as $salon): ?><option value="<?php echo $salon['id']; ?>" <?php echo ($filtro_salon == $salon['id']) ? 'selected' : ''; ?>><?php echo htmlspecialchars($salon['nombre']); ?></option><?php endforeach; ?></select></div>
            <?php endif; ?>
            <div class="filter-group"><label for="ano_cursado">Año:</label><select id="ano_cursado" name="ano_cursado"><option value="">Todos</option><?php foreach ($anios_list as $anio): ?><option value="<?php echo $anio['ano_cursado']; ?>" <?php echo ($filtro_anio == $anio['ano_cursado']) ? 'selected' : ''; ?>><?php echo htmlspecialchars($anio['ano_cursado']); ?>°</option><?php endforeach; ?></select></div>
            
            <div class="filter-group">
                <label for="carrera_id">Carrera / Orientación:</label>
                <select id="carrera_id" name="carrera_id">
                    <option value="">Todas</option>
                    <?php foreach ($carreras_list as $carrera): ?>
                        <option value="<?php echo $carrera['id']; ?>" <?php echo ($filtro_carrera == $carrera['id']) ? 'selected' : ''; ?>>
                            <?php echo htmlspecialchars($carrera['nombre']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            
            <div class="filter-actions"><button type="submit" class="filter-button">Filtrar</button><a href="salonarioexterno.php?view=<?php echo $view; ?>" class="filter-button clear">Limpiar</a></div>
        </form>

        <div class="view-switcher">
            <a href="?view=diario&<?php echo $query_string_filtros; ?>" class="<?php echo ($view === 'diario') ? 'active' : ''; ?>">Vista Diaria</a>
            <a href="?view=semanal&<?php echo $query_string_filtros; ?>" class="<?php echo ($view === 'semanal') ? 'active' : ''; ?>">Vista Semanal</a>
            <?php if ($view === 'semanal'): ?>
                <button type="button" id="downloadPdfBtn" class="download-button" title="Descargar horario semanal en PDF"><i class="fa-solid fa-download"></i></button>
            <?php endif; ?>
        </div>

        <section id="horarios" class="scroll-container">
            <?php if ($view === 'diario'): ?>
                <table id="tablaAulas">
                    <thead><tr><th>Salón</th><?php foreach ($horarios as $hora): ?><th><?php echo htmlspecialchars($hora['hora']); ?></th><?php endforeach; ?></tr></thead>
                    <tbody>
                        <?php foreach ($salones_list as $salon): ?>
                            <tr><td><?php echo htmlspecialchars($salon['nombre']); ?></td>
                                <?php foreach ($horarios as $hora): 
                                    $key = $salon['id'] . '-' . $hora['id'];
                                    $contenido = isset($asignaciones_filtradas[$key]) ? implode('<hr>', $asignaciones_filtradas[$key]) : '';
                                ?>
                                    <td class="<?php echo $contenido ? 'ocupado' : 'libre'; ?>"><?php echo $contenido; ?></td>
                                <?php endforeach; ?>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php else: // VISTA SEMANAL ?>
                <div id="printable-area">
                    <table id="tablaSemanal">
                        <thead>
                            <tr>
                                <th>Hora</th>
                                <th>Lunes</th><th>Martes</th><th>Miércoles</th><th>Jueves</th><th>Viernes</th><th>Sábado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($horarios as $hora): ?>
                                <tr>
                                    <td><?php echo htmlspecialchars($hora['hora']); ?></td>
                                    <?php 
                                    if ($fecha_lunes) {
                                        $fecha_iter = clone $fecha_lunes;
                                        for ($i = 0; $i < 6; $i++):
                                            $key = $fecha_iter->format('Y-m-d') . '-' . $hora['id'];
                                            $contenido = isset($asignaciones_filtradas[$key]) ? implode('<hr>', $asignaciones_filtradas[$key]) : '';
                                    ?>
                                            <td class="<?php echo $contenido ? 'ocupado' : 'libre'; ?>"><?php echo $contenido; ?></td>
                                    <?php 
                                            $fecha_iter->modify('+1 day');
                                        endfor; 
                                    }
                                    ?>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </section>
    </main>

    <script>
        const activeView = "<?php echo $view; ?>";
        // horasDB usa la lista completa
        const horasDB = <?php echo json_encode(array_column($horarios, 'hora')); ?>;
        const fechaMostrada = "<?php echo $filtro_fecha; ?>";
        const fechaHoy = "<?php echo date("Y-m-d"); ?>";
        const fechaLunesSemana = "<?php echo $fecha_lunes ? $fecha_lunes->format('Y-m-d') : $filtro_fecha; ?>";
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="../js/salonarioexterno.js" defer></script>
</body>
</html>