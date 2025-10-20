<?php
include_once("../api/verificar_sesion.php");
include_once("../Php/header.php");
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Gestión Académica</title>
    <link rel="stylesheet" href="../estilos/estilos.css">
    <link rel="stylesheet" href="../estilos/academico.css"> 
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>
<main>
    <aside class="carreras-panel">
        <h2>Orientaciones</h2>
        <ul id="lista-carreras">
            <!-- Las carreras se cargarán aquí dinámicamente -->
        </ul>
        <div class="panel-footer">
            <button id="btn-crear-carrera" class="btn btn-primary"><i class="fa fa-plus"></i> Nueva Orientación</button>
        </div>
    </aside>

    <section class="plan-estudio-panel">
        <div id="plan-estudio-container">
            <div id="plan-estudio-placeholder">
                <i class="fa-solid fa-arrow-left"></i>
                <h2>Selecciona una Orientación</h2>
                <p>Elige una orientación para ver o editar su plan de estudios.</p>
            </div>
            <div id="plan-estudio-detalle" style="display: none;">
                <h2 id="plan-estudio-titulo"></h2>
                <div class="anos-container" id="anos-container"></div>
            </div>
        </div>
    </section>
</main>

<!-- ======================= MODALES ======================= -->

<!-- Modal para Crear/Editar Carrera (Orientación) -->
<div id="modal-carrera" class="modal-overlay">
    <div class="modal-dialog">
        <span class="cerrar">&times;</span>
        <h3 id="modal-carrera-titulo"></h3>
        <form id="form-carrera">
            <input type="hidden" name="carrera_id" id="carrera_id">
            <div class="form-group">
                <label for="carrera_nombre">Nombre:</label>
                <input type="text" id="carrera_nombre" name="nombre" required>
            </div>
            <div class="form-group">
                <label for="carrera_color">Color:</label>
                <input type="color" id="carrera_color" name="color" value="#4a90e2">
            </div>
            <div class="form-group">
                <label for="carrera_ano">Duración (años):</label>
                <input type="number" id="carrera_ano" name="ano" min="1" max="7" value="3" required>
            </div>
            <!-- AÑADIDO: Selector de Turno -->
            <div class="form-group">
                <label for="carrera_turno">Turno:</label>
                <select id="carrera_turno" name="turno">
                    <option value="Matutino">Matutino</option>
                    <option value="Vespertino">Vespertino</option>
                    <option value="Nocturno">Nocturno</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary">Guardar</button>
        </form>
    </div>
</div>

<!-- Modal para Agregar Asignatura al Plan -->
<div id="modal-agregar-asignatura" class="modal-overlay">
    <div class="modal-dialog modal-lg">
        <span class="cerrar">&times;</span>
        <h3 id="modal-agregar-asignatura-titulo"></h3>
        <form id="form-agregar-asignatura">
            <input type="hidden" name="carrera_id" id="agregar-asig-carrera-id">
            <input type="hidden" name="ano_cursado" id="agregar-asig-ano">
            <input type="hidden" name="asignatura_id" id="agregar-asig-id" required>
            
            <div class="form-group">
                <label for="buscador-asignatura">Buscar Asignatura:</label>
                <div class="search-container">
                    <i class="fa fa-search"></i>
                    <input type="text" id="buscador-asignatura" placeholder="Escribe para buscar...">
                </div>
            </div>
            
            <div id="lista-asignaturas-resultados" class="results-list">
                <!-- Resultados de búsqueda de asignaturas -->
            </div>
            
            <div id="asignatura-seleccionada-info" class="selection-info" style="display:none;">
                <p>Seleccionada: <strong></strong></p>
            </div>

            <button type="submit" class="btn btn-primary" disabled>Agregar al Plan</button>
        </form>
    </div>
</div>

<!-- Modal para Asignar Docentes a Asignatura -->
<div id="modal-asignar-docente" class="modal-overlay">
    <div class="modal-dialog modal-lg">
        <span class="cerrar">&times;</span>
        <h3 id="modal-asignar-docente-titulo"></h3>
        <form id="form-asignar-docente">
            <input type="hidden" name="asignatura_id" id="asignar-doc-asignatura-id">
            
            <div class="form-group">
                <label for="buscador-docente">Buscar Docente:</label>
                <div class="search-container">
                    <i class="fa fa-search"></i>
                    <input type="text" id="buscador-docente" placeholder="Filtrar por nombre o apellido...">
                </div>
            </div>
            
            <p class="instruccion-texto">Selecciona los docentes habilitados para esta asignatura:</p>
            <div id="lista-docentes-checkboxes" class="results-list checkbox-list">
                <!-- Checkboxes de docentes -->
            </div>
            
            <button type="submit" class="btn btn-primary">Guardar Cambios</button>
        </form>
    </div>
</div>

<!-- Modal Genérico para Notificaciones -->
<div id="modal-notificacion" class="modal-overlay">
    <div class="modal-dialog">
        <h3 id="notificacion-titulo"></h3>
        <p id="notificacion-mensaje"></p>
        <div class="modal-actions">
            <button id="notificacion-btn-aceptar" class="btn btn-primary">Aceptar</button>
            <button id="notificacion-btn-cancelar" class="btn btn-secondary" style="display:none;">Cancelar</button>
        </div>
    </div>
</div>

<?php include_once("../Php/footer.php"); ?>
<script src="../js/academico.js"></script>
</body>
</html>
