<?php
session_start();

// Verificar que haya sesión iniciada
if (!isset($_SESSION['usuario_id'])) {
    header("Location: ../login.html");
    exit();
}

header('Content-Type: application/json');

// Conexión a la base de datos
require_once "BdB.php"; // este archivo debe devolver $conn ya conectado

$accion = $_GET['accion'] ?? null;
$response = ['success' => false, 'message' => 'Acción no válida.'];

switch ($accion) {

    case 'listar':
        $sql = "SELECT * FROM docentes ORDER BY id DESC";
        $result = $conn->query($sql);

        $docentes = [];
        while ($row = $result->fetch_assoc()) {
            $docentes[] = $row;
        }

        echo json_encode($docentes);
        exit;
        break;

    case 'crear':
        $stmt = $conn->prepare("INSERT INTO docentes (nombre, apellido, asignatura, ano_cursado, cedula, telefono) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssiss", $_POST['nombre'], $_POST['apellido'], $_POST['asignatura'], $_POST['ano_cursado'], $_POST['cedula'], $_POST['telefono']);
        $stmt->execute();

        $response = ['success' => true, 'message' => 'Docente creado con éxito.'];
        break;

    case 'actualizar':
        if (!isset($_POST['docente_id'])) break;

        $stmt = $conn->prepare("UPDATE docentes SET nombre=?, apellido=?, asignatura=?, ano_cursado=?, cedula=?, telefono=? WHERE id=?");
        $stmt->bind_param("sssissi", $_POST['nombre'], $_POST['apellido'], $_POST['asignatura'], $_POST['ano_cursado'], $_POST['cedula'], $_POST['telefono'], $_POST['docente_id']);
        $stmt->execute();

        $response = ['success' => true, 'message' => 'Docente actualizado.'];
        break;

    case 'eliminar':
        $input = json_decode(file_get_contents('php://input'), true);
        $ids_a_eliminar = $input['ids'] ?? [];

        if (!empty($ids_a_eliminar)) {
            $ids_str = implode(",", array_map('intval', $ids_a_eliminar));
            $sql = "DELETE FROM docentes WHERE id IN ($ids_str)";
            $conn->query($sql);

            $response = ['success' => true, 'message' => 'Docente(s) eliminado(s).'];
        }
        break;
}

echo json_encode($response);
