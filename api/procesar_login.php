<?php
// Siempre iniciar la sesión al principio de los archivos que la usan.
session_start();

// Incluir  archivo de conexión.
include_once 'conexion.php';

// Verificar que se hayan enviado datos por el método POST.
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Verificar que los campos no estén vacíos.
    if (empty($_POST["usuario"]) || empty($_POST["contrasena"])) {
        $_SESSION['error_login'] = "Por favor, ingrese usuario y contraseña.";
        header("Location: ../paginas/login.php"); // RUTA CORREGIDA
        exit();
    }

    // 1. Obtener los datos del formulario de forma segura.
    $email = $_POST["usuario"];
    $contrasena_ingresada = $_POST["contrasena"];

    // 2. Preparar la consulta para evitar inyecciones SQL.
    $sql = "SELECT id, Email, Contrasena FROM usuarios WHERE Email = ?";
    
    $stmt = $conn->prepare($sql);

    if ($stmt === false) {
        $_SESSION['error_login'] = "Error interno del sistema. Intente más tarde.";
        header("Location: ../paginas/login.php"); // RUTA CORREGIDA
        exit();
    }
    
    // Vinculamos el parámetro. ¡ESTA ERA LA LÍNEA DEL ERROR PRINCIPAL!
    $stmt->bind_param("s", $email);
    
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    // 3. Verificar si se encontró un usuario.
    if ($resultado->num_rows === 1) {
        $usuario = $resultado->fetch_assoc();
        
        // 4. Verificar la contraseña.
        if (password_verify($contrasena_ingresada, $usuario['Contrasena'])) {
            
            // ¡Contraseña correcta!
            $_SESSION['loggedin'] = true;
            $_SESSION['usuario_id'] = $usuario['id'];
            $_SESSION['usuario_email'] = $usuario['Email'];
            
            // Redirigimos al panel de administración.
            header("Location: ../paginas/menuinteractivo.php"); // RUTA CORREGIDA
            exit();

        } else {
            // Contraseña no coincide.
            $_SESSION['error_login'] = "Usuario o contraseña incorrectos.";
            header("Location: ../paginas/login.php"); // RUTA CORREGIDA
            exit();
        }
    } else {
        // No se encontró usuario.
        $_SESSION['error_login'] = "Usuario o contraseña incorrectos.";
        header("Location: ../paginas/login.php"); // RUTA CORREGIDA
        exit();
    }
    
    $stmt->close();
    $conn->close();

} else {
    // Si alguien intenta acceder directamente, lo redirigimos.
    header("Location: ../paginas/login.php"); // RUTA CORREGIDA
    exit();
}
?>