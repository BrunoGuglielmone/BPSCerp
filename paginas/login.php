<?php include_once("../Php/header.php"); ?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../estilos/estiloslogin.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <title>Login Cerp - Administrador</title>
</head>
<body>
    <!-- El header ya está incluido arriba -->

    <div class="fondo-transparente" aria-hidden="true"></div>

    <section>
        <form>
            <div class="titulo-con-logo">
                <img src="../imagenes/logo_cerp_3d.png" alt="Logo de Salones CerP 2025" class="logo-cabecera">
                <h1>Administrador</h1>
            </div>

            <div class="inputbox">
                <ion-icon name="mail-outline"></ion-icon>
                <input type="username" required>
                <label for="username">USUARIO</label>
            </div>

            <div class="inputbox">
                <ion-icon name="lock-closed-outline"></ion-icon>
                <input type="password" required>
                <label for="">CONTRASEÑA</label>
            </div>

            <a class="button" href="#">INICIAR</a>
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

    <?php include_once("../Php/footer.php"); ?>
</body>
</html>


