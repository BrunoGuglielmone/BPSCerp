<?php include_once("../Php/header.php"); ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Menú Interactivo</title>
    <link rel="stylesheet" href="../estilos/estilosmenu.css">
    <link rel="stylesheet" href="../estilos/estilosdocentes.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>
    <!-- El header ya está incluido arriba -->

    <main>
        <div class="contenedor">
            <!-- Tarjeta 1 -->
            <a href="docentes.php" class="tarjeta verde">
                <div class="icono">🥸</div>
                <div>
                    <h1>Docentes</h1>
                    <p>Listado de docentes con opciones para Editar, Agregar o Eliminar.</p>
                </div>
            </a>

            <!-- Tarjeta 2 -->
            <a href="#" class="tarjeta celeste">
                <div class="icono">👨‍🏫</div>
            </a>

            <!-- Tarjeta 3 -->
            <a href="#" class="tarjeta amarillo">
                <div class="icono">📚</div>
            </a>
        </div>

        <div class="contenedor">
            <a href="#" class="tarjeta verde"><div class="icono">💬</div></a>
            <a href="#" class="tarjeta celeste"><div class="icono">🗒️</div></a>
            <a href="#" class="tarjeta amarillo"><div class="icono">🔍</div></a>
        </div>

        <div class="contenedor">
            <a href="#" class="tarjeta verde"><div class="icono">💬</div></a>
            <a href="#" class="tarjeta celeste"><div class="icono">🗒️</div></a>
            <a href="#" class="tarjeta amarillo"><div class="icono">🔍</div></a>
        </div>
    </main>

    <?php include_once("../Php/footer.php"); ?>
</body>
</html>
