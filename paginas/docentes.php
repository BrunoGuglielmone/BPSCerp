<?php include_once("../Php/header.php"); ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8"> <!-- Define la codificación de caracteres para permitir acentos, ñ, etc. -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> <!-- Hace que el sitio sea responsive en móviles -->
    <title>Gestión de Docentes</title>
    
    <!-- Estilos generales y específicos de la página -->
    <link rel="stylesheet" href="../estilos/estilos.css">
    <link rel="stylesheet" href="../estilos/estilosdocentes.css">

    <!-- Librería de iconos Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>

    <!-- Contenedor principal: formulario a la izquierda y lista de docentes a la derecha -->
    <main class="main-container">

        <!-- Panel lateral con el formulario de registro -->
        <aside class="formulario-container">
            <!-- Botón que despliega/oculta el formulario -->
            <button type="button" class="toggle-form-btn">
                <i class="fa-solid fa-user-plus"></i> Registrar Nuevo Docente
            </button>

            <!-- Contenido del formulario -->
            <div class="formulario-content">
                <form id="registro-docente-form">
                    <!-- Campo oculto para manejar la edición de docentes -->
                    <input type="hidden" id="docente_id" name="docente_id">
                    
                    <h3>Datos del Docente</h3>

                    <!-- Cada input se organiza en un grupo con su etiqueta -->
                    <div class="input-group">
                        <label for="nombre">Nombre</label>
                        <input type="text" id="nombre" name="nombre" required>
                    </div>
                    <div class="input-group">
                        <label for="apellido">Apellido</label>
                        <input type="text" id="apellido" name="apellido" required>
                    </div>
                    <div class="input-group">
                        <label for="asignatura">Asignatura</label>
                        <input type="text" id="asignatura" name="asignatura" required>
                    </div>
                    <div class="input-group">
                        <label for="ano_cursado">Año Cursado</label>
                        <input type="number" id="ano_cursado" name="ano_cursado" min="1" max="4" required>
                    </div>
                    <div class="input-group">
                        <label for="cedula">Cédula</label>
                        <input type="text" id="cedula" name="cedula">
                    </div>
                    <div class="input-group">
                        <label for="telefono">Teléfono</label>
                        <input type="tel" id="telefono" name="telefono">
                    </div>

                    <!-- Botón de guardar -->
                    <button type="submit" class="btn-guardar">Guardar Docente</button>
                </form>
            </div>
        </aside>

        <!-- Sección con la tabla/lista de docentes -->
        <section class="lista-container">

            <!-- Barra superior con buscador y botones de acción -->
            <div class="toolbar">
                <!-- Barra de búsqueda -->
                <div class="search-bar">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="busqueda" placeholder="Buscar profesor...">
                </div>

                <!-- Botones para editar/eliminar registros seleccionados -->
                <div class="actions">
                    <button class="btn-accion btn-editar-seleccionado" disabled>
                        <i class="fa-solid fa-pencil"></i> Editar
                    </button>
                    <button class="btn-accion btn-eliminar-seleccionado" disabled>
                        <i class="fa-solid fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>

            <!-- Tabla de docentes -->
            <div class="tabla-responsive">
                <table id="tabla-docentes">
                    <thead>
                        <tr>
                            <!-- Checkbox para seleccionar todos -->
                            <th><input type="checkbox" id="seleccionar-todos"></th>
                            <th>
                                <a href="#" data-sort="nombre">Nombre y Apellido 
                                    <i class="fa-solid fa-sort"></i>
                                </a>
                            </th>
                            <th>
                                <a href="#" data-sort="asignatura">Asignatura 
                                    <i class="fa-solid fa-sort"></i>
                                </a>
                            </th>
                            <th>
                                <a href="#" data-sort="ano">Año 
                                    <i class="fa-solid fa-sort"></i>
                                </a>
                            </th>
                            <th>Otros Datos</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Aquí se insertarán las filas dinámicamente con JavaScript -->
                    </tbody>
                </table>
            </div>
        </section>

    </main>


    <!-- Archivos JS al final para no bloquear la carga -->
    <script src="../js/docentes.js"></script>
    <script>
        // --- Lógica para abrir/cerrar el formulario ---
        const toggleBtn = document.querySelector('.toggle-form-btn');
        const formContent = document.querySelector('.formulario-content');
        
        if(toggleBtn && formContent) {
            toggleBtn.addEventListener('click', () => {
                formContent.classList.toggle('abierto'); // Alterna la visibilidad
                const icon = toggleBtn.querySelector('i');
                // Cambia el ícono según el estado
                if (formContent.classList.contains('abierto')) {
                    icon.classList.remove('fa-user-plus');
                    icon.classList.add('fa-chevron-up');
                } else {
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-user-plus');
                }
            });
        } 
    </script>
    <?php 
    // Incluye el footer si lo necesitas.
    include_once("../Php/footer.php"); 
    ?>
    
</body>
</html>
