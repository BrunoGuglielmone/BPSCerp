<?php
include_once("../api/verificar_sesion.php");
$titulo_pagina = "Gestión de Asignaturas"; 
include_once("../Php/header.php");
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Gestión de Asignaturas</title>
    <link rel="stylesheet" href="../estilos/estilos.css">
    <link rel="stylesheet" href="../estilos/estilosasignaturas.css"> 
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>
    <main class="main-container">
        <aside class="formulario-container">
            <button type="button" class="toggle-form-btn"><i class="fa-solid fa-plus"></i> Registrar Nueva Asignatura</button>
            <div class="formulario-content">
                <form id="form-asignatura">
                    <input type="hidden" id="asignatura_id" name="asignatura_id">
                    <h3 id="form-title">Nueva Asignatura</h3>
                    <div class="input-group">
                        <label for="nombre">Nombre de la Asignatura</label>
                        <input type="text" id="nombre" name="nombre" required>
                    </div>
                    <button type="submit" class="btn-guardar" id="btn-guardar-texto">Guardar Asignatura</button>
                </form>
            </div>
        </aside>

        <section class="lista-container">
            <div class="toolbar">
                <h3>Lista Maestra de Asignaturas</h3>
                <div class="actions">
                    <button class="btn-accion btn-editar-seleccionado" disabled><i class="fa-solid fa-pencil"></i> Editar</button>
                    <button class="btn-accion btn-eliminar-seleccionado" disabled><i class="fa-solid fa-trash"></i> Eliminar</button>
                </div>
            </div>
            <div class="tabla-responsive">
                <table id="tabla-asignaturas">
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="seleccionar-todos"></th>
                            <th>Nombre</th>
                            <th>Acciones</th>
                        </tr>
                        <tr class="filtros-fila">
                            <th></th>
                            <th><input type="text" placeholder="Filtrar por nombre..." class="filtro-input"></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        </tbody>
                </table>
            </div>
        </section>
    </main>

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

    <script src="../js/asignaturas.js"></script>
    <?php include_once("../Php/footer.php"); ?>
</body>
</html>