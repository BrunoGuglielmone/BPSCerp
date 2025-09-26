
<?php
// ¡Este es el guardia! Se asegura de que solo usuarios autenticados vean el menú.
include_once("../api/verificar_sesion.php");
include_once("../Php/header.php"); 
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Menú Interactivo</title>
        <link rel="stylesheet" href="../estilos/estilos.css">
    <link rel="stylesheet" href="../estilos/estilosmenu.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>

    <main>
        <div class="contenedor">
            <a href="docentes.php" class="tarjeta tarjeta-azul">
                <div class="icono"><i class="fa-solid fa-chalkboard-user"></i></div>
                <div>
                    <h1>Docentes</h1>
                    <p>Gestiona el listado de docentes: agregar, editar o eliminar registros.</p>
                </div>
            </a>

            <a href="salonario.php" class="tarjeta tarjeta-celeste">
                <div class="icono"><i class="fa-solid fa-calendar-alt"></i></div>
                <div>
                    <h1>Salonario</h1>
                    <p>Administra los horarios de salones y realiza las asignaciones.</p>
                </div>
            </a>

            <a href="salones.php" class="tarjeta tarjeta-verde">
                <div class="icono"><i class="fa-solid fa-school"></i></div>
                <div>
                    <h1>Gestión de Salones</h1>
                    <p>Administra los salones disponibles: agregar, editar o eliminar.</p>
                </div>
            </a>

            <a href="salonarioexterno.php" class="tarjeta tarjeta-amarillo">
                <div class="icono"><i class="fa-solid fa-eye"></i></div>
                <div>
                    <h1>Vista Previa Salonario</h1>
                    <p>Consulta los horarios de los salones en tiempo real (vista pública).</p>
                </div>
            </a>

            <a href="logout.php" class="tarjeta tarjeta-roja">
                <div class="icono"><i class="fa-solid fa-right-from-bracket"></i></div>
                <div>
                    <h1>Cerrar Sesión</h1>
                    <p>Salir de tu cuenta de forma segura y volver a la pantalla de inicio.</p>
                </div>
            </a>
        </div>
    </main>

    <?php include_once("../Php/footer.php"); ?>
</body>
</html>
