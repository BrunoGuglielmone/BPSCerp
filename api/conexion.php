<?php
// Configuración de la conexión a la base de datos
$servername = "localhost"; // Generalmente es 'localhost'
$username = "root";      // Usuario por defecto de XAMPP/WAMP
$password = "";          // Contraseña por defecto de XAMPP/WAMP es vacía
$dbname = "bpsc_erp";      // Nombre de tu base de datos

// Crear la conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar si hay errores en la conexión
if ($conn->connect_error) {
    // Detener la ejecución y mostrar el error
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500); // Internal Server Error
    die(json_encode([
        "success" => false,
        "message" => "Error de conexión a la base de datos: " . $conn->connect_error
    ]));
}

// Establecer el juego de caracteres a UTF-8 para manejar acentos y 'ñ'
$conn->set_charset("utf8");
?>