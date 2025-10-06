<?php
// 1. Reanudar la sesión que ya hemos iniciado en el logi
session_start();

// 2. Comprobar si la variable de sesión 'loggedin' no está establecida
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    
    // 3. Si no ha iniciado sesión, redirigir al usuario a la página de login.
    header('Location: ../paginas/login.php');
    
    // 4. Detener la ejecución del script para asegurarnos de que no se cargue
    // el resto de la página protegida.
    exit;
}

// Enviar cabeceras para prevenir el almacenamiento en caché.
// Esto le dice al navegador que no guarde una copia de la página.
// Así, si el usuario cierra sesión y presiona "atrás", el navegador
// se verá forzado a solicitar la página de nuevo, y nuestro script lo
// redirigirá al login porque la sesión ya no existe.
header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
header('Pragma: no-cache'); // HTTP 1.0.
header('Expires: 0'); // Proxies.
?>