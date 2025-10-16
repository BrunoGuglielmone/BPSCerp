<?php
include_once("../api/verificar_sesion.php");
include_once("../Php/header.php");
include_once("../api/conexion.php");

// Consultas para poblar los desplegables y checkboxes del formulario
$asignaturas_res = $conn->query("SELECT id, nombre FROM asignaturas ORDER BY nombre ASC");
$asignaturas_list = $asignaturas_res->fetch_all(MYSQLI_ASSOC);
$carreras_res = $conn->query("SELECT id, nombre FROM carreras ORDER BY nombre ASC");
$carreras_list = $carreras_res->fetch_all(MYSQLI_ASSOC);
$conn->close();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Gestión de Docentes</title>
    <link rel="stylesheet" href="../estilos/estilos.css">
    <link rel="stylesheet" href="../estilos/estilosdocentes.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>
    <main class="main-container">
        <aside class="formulario-container">
            <button type="button" class="toggle-form-btn"><i class="fa-solid fa-user-plus"></i> Registrar Nuevo Docente</button>
            <div class="formulario-content">
                <form id="registro-docente-form">
                    <input type="hidden" id="docente_id" name="docente_id">
                    <h3>Datos del Docente</h3>
                    <div class="input-group">
                        <label for="nombre">Nombre</label>
                        <input type="text" id="nombre" name="nombre" required>
                    </div>
                    <div class="input-group">
                        <label for="apellido">Apellido</label>
                        <input type="text" id="apellido" name="apellido" required>
                    </div>
                    <div class="input-group">
                        <label for="cedula">Cédula (sin puntos ni guiones)</label>
                        <input type="text" id="cedula" name="cedula" required>
                    </div>
                    <div class="input-group">
                        <label for="asignatura_id">Asignatura Principal</label>
                        <select id="asignatura_id" name="asignatura_id" required>
                            <option value="">Seleccione una asignatura...</option>
                            <?php foreach ($asignaturas_list as $asignatura): ?>
                                <option value="<?php echo $asignatura['id']; ?>">
                                    <?php echo htmlspecialchars($asignatura['nombre']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Carreras</label>
                        <div class="checkbox-group">
                            <?php if (empty($carreras_list)): ?>
                                <p>No hay carreras registradas. <a href="carreras.php">Agregar carreras</a>.</p>
                            <?php else: ?>
                                <?php foreach ($carreras_list as $carrera): ?>
                                    <div class="checkbox-item">
                                        <input type="checkbox" name="carreras[]" value="<?php echo $carrera['id']; ?>" id="carrera-<?php echo $carrera['id']; ?>">
                                        <label for="carrera-<?php echo $carrera['id']; ?>"><?php echo htmlspecialchars($carrera['nombre']); ?></label>
                                    </div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                    </div>
                    <div class="input-group">
                        <label for="ano_cursado">Año Cursado</label>
                        <input type="number" id="ano_cursado" name="ano_cursado" min="1" max="4" required>
                    </div>
                    <div class="input-group">
                        <label for="telefono">Teléfono (hasta 15 dígitos)</label>
                        <input type="tel" id="telefono" name="telefono" 
                               maxlength="15" pattern="[0-9]+" title="Solo se permiten números."
                               inputmode="numeric">
                    </div>
                    <button type="submit" class="btn-guardar">Guardar Docente</button>
                </form>
            </div>
        </aside>

        <section class="lista-container">
            <div class="toolbar">
                 <h3>Lista de Docentes</h3>
                <div class="actions">
                    <button class="btn-accion btn-editar-seleccionado" disabled><i class="fa-solid fa-pencil"></i> Editar</button>
                    <button class="btn-accion btn-eliminar-seleccionado" disabled><i class="fa-solid fa-trash"></i> Eliminar</button>
                </div>
            </div>
            <div class="tabla-responsive">
                <table id="tabla-docentes">
                     <thead>
                        <tr>
                            <th><input type="checkbox" id="seleccionar-todos"></th>
                            <th>Nombre y Apellido</th>
                            <th>Asignatura</th>
                            <th>Año</th>
                            <th>Carreras</th>
                            <th>Otros Datos</th>
                            <th>Acciones</th>
                        </tr>
                        <tr class="filtros-fila">
                            <th></th>
                            <th><input type="text" placeholder="Filtrar..." data-columna="nombre_completo" class="filtro-input"></th>
                            <th><input type="text" placeholder="Filtrar..." data-columna="asignatura_nombre" class="filtro-input"></th>
                            <th><input type="text" placeholder="Filtrar..." data-columna="ano_cursado" class="filtro-input"></th>
                            <th><input type="text" placeholder="Filtrar..." data-columna="carreras_nombres" class="filtro-input"></th>
                            <th><input type="text" placeholder="Filtrar..." data-columna="otros_datos" class="filtro-input"></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </section>
    </main>

    <script src="../js/docentes.js"></script>
    <script>
        document.querySelector('.toggle-form-btn').addEventListener('click', e => {
            document.querySelector('.formulario-content').classList.toggle('abierto');
            const icon = e.currentTarget.querySelector('i');
            icon.classList.toggle('fa-user-plus');
            icon.classList.toggle('fa-chevron-up');
        });
    </script>
    <?php include_once("../Php/footer.php"); ?>
</body>
</html>