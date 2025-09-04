<?php
include_once __DIR__ . "api/conexion.php"; // Ajusta la ruta si es necesario

header('Content-Type: application/json; charset=utf-8');

$result = $conn->query("SELECT id, nombre, apellido, asignatura, ano_cursado, cedula, telefono FROM docentes ORDER BY nombre ASC");

$docentes = [];
while ($row = $result->fetch_assoc()) {
    $docentes[] = $row;
}

echo json_encode($docentes);

$conn->close();
