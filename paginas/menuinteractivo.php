<?php include_once("../Php/header.php"); ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Menú Interactivo</title>
    <link rel="stylesheet" href="../estilos/estilosmenu.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>

    <main>
        <div class="contenedor">
            <!-- Tarjeta Docentes -->
            <a href="docentes.php" class="tarjeta tarjeta-azul">
                <div class="icono"><i class="fa-solid fa-chalkboard-user"></i></div>
                <div>
                    <h1>Docentes</h1>
                    <p>Gestiona el listado de docentes: agregar, editar o eliminar registros.</p>
                </div>
            </a>

            <!-- Tarjeta Salonario -->
            <a href="salonario.php" class="tarjeta tarjeta-celeste">
                <div class="icono"><i class="fa-solid fa-calendar-alt"></i></div>
                <div>
                    <h1>Salonario</h1>
                    <p>Consulta y administra los horarios de salones y asignaciones.</p>
                </div>
            </a>

            <!-- Tarjeta Cerrar Sesión -->
            <a href="login.php" class="tarjeta tarjeta-roja">
                <div class="icono"><i class="fa-solid fa-right-from-bracket"></i></div>
                <div>
                    <h1>Cerrar sesión</h1>
                    <p>Salir de tu cuenta de forma segura y volver a la pantalla de inicio.</p>
                </div>
            </a>
        </div>
    </main>

    <?php include_once("../Php/footer.php"); ?>
</body>
</html>
