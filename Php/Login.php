<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    include('BdB.php');
}
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Login</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="EstilosLogin.css">
</head>

<body>
    <div class="Contenedor_Login">
        <div class="Logo"></div>
        <form action="Login.php" method="POST" class="Login">
            <div class="Text_login">
                <h2>Bienvenido Nuevamente</h2>
                <p>Inicio de sesión</p>
            </div>
            <div class="input">
                <label for="usuario">Usuario</label>
                <input placeholder="Email" type="text" id="usuario" name="usuario" required>
            </div>
            <div class="input">
                <label for="contra">Contraseña</label>
                <input placeholder="Ingresa tu contraseña" type="password" id="contra" name="contra" required>
            </div>
            <div class="Contra_olvidada">
                <a href="#">¿Olvidaste tu Contraseña?</a>
            </div>
            <div class="input">
                <input type="submit" value="Iniciar">
            </div>
        </form>
    </div>
</body>

</html>





