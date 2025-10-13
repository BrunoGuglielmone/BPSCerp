<?php
include_once("../api/verificar_sesion.php");
include_once("../Php/header.php"); 
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <title>Administración de Salones</title>
    <link rel="stylesheet" href="../estilos/estilos.css" />
    <link rel="stylesheet" href="../estilos/estilosalonario.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>

<main>
    <section class="tabla-container">
        
        <div class="calendario-container">
            <div class="semestre-toggle">
                <input type="checkbox" id="semestreToggleInput" class="semestre-toggle-input">
                <label for="semestreToggleInput" class="semestre-toggle-label"></label>
            </div>
            
            <div class="fecha-especifica">
                <label for="fechaInput">Ver fecha:</label>
                <input type="date" id="fechaInput">
            </div>
        <div class="fecha-especifica">
            <label for="fechaInput">Ver fecha:</label>
            <input type="date" id="fechaInput">
        </div>

        <div class="acciones-tabla">
            <button id="asignarProfesorBtn" class="btn-animado" disabled><span>Asignar a seleccionadas</span></button>
            <button id="asignarSemestreBtn" class="btn-animado"><span>Asignar a todo el semestre</span></button>
            <button id="exportarCSVBtn" class="btn-animado"><span>Exportar tabla a CSV</span></button>
        </div>

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

<?php include_once("../Php/footer.php"); ?>

<script src="../js/salonario.js"></script>

<?php include_once("../Php/footer.php"); ?>
<script src="../js/salonario.js"></script>
</body>
</html>