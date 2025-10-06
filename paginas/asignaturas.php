<?php
include_once("../api/verificar_sesion.php");
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
            <button type="button" class="toggle-form-btn">
                <i class="fa-solid fa-plus"></i> Registrar Nueva Asignatura
            </button>
            <div class="formulario-content">
                <form id="registro-asignatura-form">
                    <input type="hidden" id="asignatura_id" name="asignatura_id">
                    <h3>Datos de la Asignatura</h3>
                    <div class="input-group">
                        <label for="nombre">Nombre de la Asignatura</label>
                        <input type="text" id="nombre" name="nombre" required>
                    </div>
                    <button type="submit" class="btn-guardar">Guardar Asignatura</button>
                </form>
            </div>
        </aside>

        <section class="lista-container">
            <div class="toolbar">
                <h3>Lista de Asignaturas</h3>
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
                            <th>Nombre de la Asignatura</th>
                            <th>Acciones</th>
                        </tr>
                         <tr class="filtros-fila">
                            <th></th>
                            <th><input type="text" placeholder="Filtrar por nombre..." data-columna="nombre" class="filtro-input"></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </section>
    </main>

    <script src="../js/asignaturas.js"></script>
    <script>
        document.querySelector('.toggle-form-btn').addEventListener('click', e => {
            document.querySelector('.formulario-content').classList.toggle('abierto');
            const icon = e.currentTarget.querySelector('i');
            icon.classList.toggle('fa-plus');
            icon.classList.toggle('fa-chevron-up');
        });
    </script>
    <?php include_once("../Php/footer.php"); ?>
</body>
</html>