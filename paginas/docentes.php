<?php
include_once("../api/verificar_sesion.php");
include_once("../Php/header.php");
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
                    <h3 id="form-title">Datos del Docente</h3>
                    <div class="input-group">
                        <label for="nombre">Nombre</label>
                        <input type="text" id="nombre" name="nombre" required>
                    </div>
                    <div class="input-group">
                        <label for="apellido">Apellido</label>
                        <input type="text" id="apellido" name="apellido" required>
                    </div>
                    <div class="input-group">
                        <label for="cedula">Cédula (8 dígitos, sin puntos ni guion)</label>
                        <input type="text" id="cedula" name="cedula" required 
                               maxlength="8" pattern="[0-9]{8}" title="Debe contener exactamente 8 números."
                               inputmode="numeric">
                    </div>
                    <div class="input-group">
                        <label for="telefono">Teléfono (hasta 15 dígitos)</label>
                        <input type="tel" id="telefono" name="telefono" 
                               maxlength="15" pattern="[0-9]+" title="Solo se permiten números."
                               inputmode="numeric">
                    </div>
                    <button type="submit" class="btn-guardar" id="btn-guardar-texto">Guardar Docente</button>
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
                            <th>Cédula</th>
                            <th>Teléfono</th>
                            <th>Acciones</th>
                        </tr>
                        <tr class="filtros-fila">
                            <th></th>
                            <th><input type="text" placeholder="Filtrar por nombre..." data-columna="nombre_completo" class="filtro-input"></th>
                            <th><input type="text" placeholder="Filtrar por cédula..." data-columna="cedula" class="filtro-input"></th>
                            <th><input type="text" placeholder="Filtrar por teléfono..." data-columna="telefono" class="filtro-input"></th>
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