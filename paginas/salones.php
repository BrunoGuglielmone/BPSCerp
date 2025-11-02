<?php 
include_once("../api/verificar_sesion.php");
$titulo_pagina = "Gestión de Salones";
include_once("../Php/header.php"); 
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Salones</title>
    <link rel="stylesheet" href="../estilos/estilos.css">
    <link rel="stylesheet" href="../estilos/estilosalones.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>

    <main class="main-container">
        <aside class="formulario-container">
            <button type="button" class="toggle-form-btn">
                <i class="fa-solid fa-plus"></i> Registrar Nuevo Salón
            </button>
            <div class="formulario-content">
                <form id="registro-salon-form">
                    <input type="hidden" id="salon_id" name="salon_id">
                    <h3 id="form-title">Datos del Salón</h3>
                    <div class="input-group">
                        <label for="nombre">Nombre del Salón</label>
                        <input type="text" id="nombre" name="nombre" required>
                    </div>
                    <div class="input-group">
                        <label for="capacidad">Capacidad</label>
                        <input type="number" id="capacidad" name="capacidad" min="1" required>
                    </div>
                    <div class="input-group">
                        <label for="tipo">Tipo de Salón</label>
                        <select id="tipo" name="tipo" required>
                            <option value="">Seleccione un tipo...</option>
                            <option value="Común">Común</option>
                            <option value="Sala informática">Sala informática</option>
                            <option value="Laboratorio Biología">Laboratorio Biología</option>
                            <option value="Laboratorio Física">Laboratorio Física</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-guardar" id="btn-guardar-texto">Guardar Salón</button>
                </form>
            </div>
        </aside>

        <section class="lista-container">
            <div class="toolbar">
                <h3>Lista de Salones</h3>
                <div class="actions">
                    <button class="btn-accion btn-editar-seleccionado" disabled><i class="fa-solid fa-pencil"></i> Editar</button>
                    <button class="btn-accion btn-eliminar-seleccionado" disabled><i class="fa-solid fa-trash"></i> Eliminar</button>
                </div>
            </div>
            <div class="tabla-responsive">
                <table id="tabla-salones">
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="seleccionar-todos"></th>
                            <th>Nombre</th>
                            <th>Capacidad</th>
                            <th>Tipo</th>
                            <th>Acciones</th>
                        </tr>
                        <tr class="filtros-fila">
                            <th></th>
                            <th><input type="text" placeholder="Filtrar por nombre..." data-columna="nombre" class="filtro-input"></th>
                            <th><input type="text" placeholder="Filtrar por capacidad..." data-columna="capacidad" class="filtro-input"></th>
                            <th>
                                <select data-columna="tipo" class="filtro-input">
                                    <option value="">Todos</option>
                                    <option value="Común">Común</option>
                                    <option value="Sala informática">Sala informática</option>
                                    <option value="Laboratorio Biología">Laboratorio Biología</option>
                                    <option value="Laboratorio Física">Laboratorio Física</option>
                                </select>
                            </th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody></tbody>
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

    <script src="../js/salones.js"></script>
    <script>
        document.querySelector('.toggle-form-btn').addEventListener('click', e => {
            const formContent = document.querySelector('.formulario-content');
            formContent.classList.toggle('abierto');
            const icon = e.currentTarget.querySelector('i');
            icon.classList.toggle('fa-plus');
            icon.classList.toggle('fa-chevron-up');
        });
    </script>
    
    <?php include_once("../Php/footer.php"); ?>
</body>
</html>