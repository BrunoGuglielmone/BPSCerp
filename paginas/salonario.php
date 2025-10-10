<?php
include_once("../api/verificar_sesion.php");
include_once("../Php/header.php");
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <title>Gestión de Horarios - Salonario</title>
    <link rel="stylesheet" href="../estilos/estilos.css" />
    <link rel="stylesheet" href="../estilos/estilosalonario.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>
<main class="main-container">
    <div class="calendario-container">
        <div id="semana-botones" class="semana-botones">
            </div>
        <div class="fecha-especifica">
            <label for="fechaInput">Ver fecha:</label>
            <input type="date" id="fechaInput">
        </div>
        <div class="configuracion-semestre">
            <button id="configSemestreBtn" class="btn-animado"><span><i class="fa-solid fa-calendar-days"></i> Configurar Semestres</span></button>
        </div>
    </div>

    <div class="acciones-tabla">
        <button id="asignarACeldaBtn" class="btn-animado" disabled><span><i class="fa-solid fa-plus"></i> Asignar a Celda(s)</span></button>
        <button id="asignarSemestreBtn" class="btn-animado"><span><i class="fa-solid fa-clone"></i> Asignar Horario al Semestre</span></button>
        <button id="exportarCSVBtn" class="btn-animado" style="display: none;"><span><i class="fa-solid fa-file-csv"></i> Exportar a CSV</span></button>
    </div>

    <div class="tabla-container">
        <table id="tablaHorarios">
            <thead>
                <tr><th>Salón</th></tr>
            </thead>
            <tbody>
                </tbody>
        </table>
    </div>
</main>

<div id="modal-asignacion" class="modal-overlay">
    <div class="modal-dialog">
        <span id="cerrarModal" class="cerrar">&times;</span>
        <h3>Nueva Asignación</h3>
        <p id="info-celda"></p>
        <div class="form-group">
            <label for="modal-asignatura-select">1. Seleccione la Asignatura:</label>
            <select id="modal-asignatura-select"></select>
        </div>
        <div class="form-group">
            <label for="modal-docente-select">2. Seleccione el Docente:</label>
            <select id="modal-docente-select" disabled></select>
        </div>
        <button id="confirmarAsignacionBtn" disabled>Confirmar Asignación</button>
    </div>
</div>

<div id="modalSemestre" class="modal-overlay">
    <div class="modal-dialog">
        <span id="cerrarModalSemestre" class="cerrar">&times;</span>
        <h3>Configurar Fechas de Semestres</h3>
        <div class="form-semestre">
            <fieldset>
                <legend>Primer Semestre</legend>
                <label for="semestre1_inicio">Fecha de Inicio:</label>
                <input type="date" id="semestre1_inicio">
                <label for="semestre1_fin">Fecha de Fin:</label>
                <input type="date" id="semestre1_fin">
            </fieldset>
            <fieldset>
                <legend>Segundo Semestre</legend>
                <label for="semestre2_inicio">Fecha de Inicio:</label>
                <input type="date" id="semestre2_inicio">
                <label for="semestre2_fin">Fecha de Fin:</label>
                <input type="date" id="semestre2_fin">
            </fieldset>
        </div>
        <button id="guardarFechasSemestreBtn">Guardar Configuración</button>
    </div>
</div>

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
<script src="../js/salonario.js"></script>
</body>
</html>