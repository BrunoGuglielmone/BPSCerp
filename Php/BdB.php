<?php
// Verificar Si envio los datos desde el login
if (isset($_POST["usuario"]) && isset($_POST["contra"])) {
    // la conexion de la BdD
    $Dbname = "proyecto_salones";
    $Dbuser = "root";
    $DbD = "localhost";
    $Dbpass = "";
    $conn = new mysqli($DbD, $Dbuser, $Dbpass, $Dbname);

    // Verificar si funciona
    if ($conn->connect_errno) {
        echo "Error al conectar a la base de datos: " . $conn->connect_error;
        exit();
    }

    //extrae los datos del login
    $usu = $_POST["usuario"];
    $pass = $_POST["contra"];

   
    $usu = $conn->real_escape_string($usu);
    $pass = $conn->real_escape_string($pass);

    // Consulta a la base de datos 
    $queryusuario = mysqli_query($conn, "SELECT * FROM usuarios WHERE Email='$usu' AND Contraseña='$pass'");

    // Verificar si existe el user
    $nr = mysqli_num_rows($queryusuario);

    if ($nr == 1) {
     
        header("Location: http://127.0.0.1:5500/");
        exit(); 
    } else {
       
        echo "Usuario Incorrecto";
    }
} else {
    
    echo "Por favor ingrese usuario y contraseña.";
}
?>

