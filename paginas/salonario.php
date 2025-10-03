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
            <tbody></tbody>
        </table>
    </section>
</main>

<div id="modal" class="modal">
    <div class="modal-content">
        <span id="cerrarModal" class="cerrar">&times;</span>
        <h3>Seleccionar Docente</h3>
        <div class="modal-filtros">
            <label>Año:
                <select id="filtroAnio">
                    <option value="">Todos</option>
                    <option value="1">1° Año</option>
                    <option value="2">2° Año</option>
                    <option value="3">3° Año</option>
                    <option value="4">4° Año</option>
                </select>
            </label>
            <label>Asignatura:
                <input type="text" id="filtroAsignatura" placeholder="Filtrar por asignatura" />
            </label>
        </div>
        <div id="listaProfesores"></div>
        <button id="confirmarAsignacionBtn" disabled>Confirmar asignación</button>
    </div>
</div>

<?php include_once("../Php/footer.php"); ?>

<script src="../js/salonario.js"></script>

</body>
</html>