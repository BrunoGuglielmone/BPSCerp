<?php
// 1. Reanudar la sesión existente para poder acceder a ella.
session_start();

// 2. Eliminar todas las variables de la sesión.
// Esto vacía el array $_SESSION, borrando datos como 'loggedin', 'usuario_id', etc.
$_SESSION = array();

// 3. Destruir la sesión.
// Esto elimina el archivo de sesión del servidor.
session_destroy();

// 4. Redirigir al usuario de vuelta a la página de login.
header("Location: ../paginas/login.php");

// 5. Asegurarse de que el script se detenga después de la redirección.
exit;
?>