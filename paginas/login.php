<?php
// Inicia la sesión para poder manejar mensajes de error.
session_start();

// Incluye el header si lo necesitas.
include_once("../Php/header.php"); 
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../estilos/estiloslogin.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <title>Login Cerp</title>
    <style>
        /* Estilo simple para el mensaje de error */
        .error-message {
            background-color: #f8d7da;
            color: #721c24;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="fondo-transparente" aria-hidden="true"></div>

    <section>
        <!-- El formulario ahora apunta a "procesar_login.php" y usa el método POST -->
        <form action="../api/procesar_login.php" method="POST">
            <div class="titulo-con-logo">
                <img src="../imagenes/logo_cerp_3d.png" alt="Logo de Salones CerP 2025" class="logo-cabecera">
                <h1>Administrador</h1>
            </div>

            <?php
            // Muestra un mensaje de error si existe en la sesión
            if (isset($_SESSION['error_login'])) {
                echo '<div class="error-message">' . $_SESSION['error_login'] . '</div>';
                // Limpia el error de la sesión para que no se muestre de nuevo
                unset($_SESSION['error_login']);
            }
            ?>

            <div class="inputbox">
                <ion-icon name="mail-outline"></ion-icon>
                <!-- Agregamos el atributo "name" para que PHP pueda recibir el dato -->
                <input type="text" name="usuario" id="usuario" required>
                <label for="usuario">USUARIO (Email)</label>
            </div>

            <div class="inputbox">
                <ion-icon name="lock-closed-outline"></ion-icon>
                 <!-- Agregamos el atributo "name" para que PHP pueda recibir el dato -->
                <input type="password" name="contrasena" id="contrasena" required>
                <label for="contrasena">CONTRASEÑA</label>
            </div>
            
            <!-- Cambiamos la etiqueta <a> por <button type="submit"> para enviar el formulario -->
            <button type="submit" class="button">INICIAR</button>
        </form>
    </section>

    <div class="footer-contacto">
        <a href="https://www.facebook.com/p/Cerp-del-Litoral-Salto-100091001754556/?locale=es_LA" target="_blank" title="Facebook">
            <i class="fab fa-facebook"></i>
        </a>
        <a href="https://www.instagram.com/cerp_del_litoral_salto/?hl=es" target="_blank" title="Instagram">
            <i class="fab fa-instagram"></i>
        </a>
        <a href="mailto:contacto@cerpsalto.edu.uy" title="Correo Electrónico">
            <i class="fas fa-envelope"></i>
        </a>
    </div>

    <?php 
    // Incluye el footer si lo necesitas.
    include_once("../Php/footer.php"); 
    ?>
</body>
</html>
