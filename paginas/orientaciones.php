<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Orientaciones - CERP Litoral</title>
    <link rel="stylesheet" href="../estilos/estilos.css">
    <link rel="stylesheet" href="../estilos/orientaciones.css">
</head>
<body>

    <header class="page-header">
        <div class="logo-container">
            <img src="../imagenes/logo_cerp_3d.png" alt="Logo CERP">
        </div>
        <div class="header-controls">
            <span id="reloj" class="reloj"></span>
            <a href="../paginas/menuinteractivo.php" class="menu-button btn-animado">
                <span>Volver</span>
            </a>
        </div>
    </header>

    <main class="main-container">
        <div class="toolbar">
            <div class="filter-group">
                <input type="text" id="filtro-nombre" placeholder="Buscar por nombre...">
            </div>
            <button id="btn-crear-orientacion" class="filter-button">
                <i class="fas fa-plus"></i> Crear Orientación
            </button>
        </div>

        <div id="orientaciones-por-ano-container">
            </div>
    </main>

    <div id="modal-orientacion" class="modal-backdrop" style="display: none;">
        <div class="modal-content">
            <form id="form-orientacion">
                <h2 id="modal-titulo">Crear Orientación</h2>
                <input type="hidden" id="carrera_id" name="carrera_id">
                
                <div class="form-row">
                    <div class="form-group" style="flex: 3;">
                        <label for="nombre">Nombre de la Orientación:</label>
                        <input type="text" id="nombre" name="nombre" required>
                    </div>
                    <div class="form-group" style="flex: 1;">
                         <label for="ano">Año:</label>
                         <select id="ano" name="ano" required>
                             <option value="1">1º Año</option>
                             <option value="2">2º Año</option>
                             <option value="3">3º Año</option>
                             <option value="4">4º Año</option>
                         </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="color">Color:</label>
                        <input type="color" id="color" name="color" value="#4a90e2">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Asignaturas:</label>
                        <div id="lista-asignaturas-modal" class="checkbox-container">
                            </div>
                    </div>

                    <div class="form-group">
                        <label>Docentes:</label>
                        <div id="lista-docentes-modal" class="checkbox-container">
                             </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" id="btn-cerrar-modal" class="btn-secondary">Cancelar</button>
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" id="btn-eliminar" class="btn-danger" style="display: none;">Eliminar</button>
                </div>
            </form>
        </div>
    </div>

    <div id="toast-container"></div>
    
    <script src="https://kit.fontawesome.com/1d10b78c90.js" crossorigin="anonymous"></script>
    <script src="../js/orientaciones.js"></script>
</body>
</html>