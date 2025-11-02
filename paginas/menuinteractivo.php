<?php
include_once("../api/verificar_sesion.php");
$titulo_pagina = "Menú Interactivo";
include_once("../Php/header.php"); 
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Menú Interactivo - CERP Litoral</title>
    <link rel="stylesheet" href="../estilos/estilos.css">
    <link rel="stylesheet" href="../estilos/estilosmenu.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>

    <main>
        <div class="contenedor">
            
            <a href="academico.php" class="tarjeta tarjeta-purpura">
                <div class="icono"><i class="fa-solid fa-sitemap"></i></div>
                <div>
                    <h1>Planes de Estudio</h1>
                    <p>Gestiona carreras, planes por año y asigna docentes a las asignaturas.</p>
                </div>
            </a>

            <a href="salonario.php" class="tarjeta tarjeta-celeste">
                <div class="icono"><i class="fa-solid fa-calendar-alt"></i></div>
                <div>
                    <h1>Salonario</h1>
                    <p>Administra los horarios de salones y realiza las asignaciones diarias.</p>
                </div>
            </a>

            <a href="docentes.php" class="tarjeta tarjeta-azul">
                <div class="icono"><i class="fa-solid fa-chalkboard-user"></i></div>
                <div>
                    <h1>Docentes</h1>
                    <p>Gestiona el listado de docentes: agregar, editar o eliminar registros.</p>
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

            <a href="asignaturas.php" class="tarjeta tarjeta-naranja">
                <div class="icono"><i class="fa-solid fa-book"></i></div>
                <div>
                    <h1>Asignaturas</h1>
                    <p>Administra la lista maestra de asignaturas del centro educativo.</p>
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