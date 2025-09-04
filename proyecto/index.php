<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard</title>
  <link rel="stylesheet" href="style.css">
  <!-- FontAwesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body>
  <header>
    <div class="logo">Mi App</div>
    <button class="logout">Log out</button>
  </header>

  <main class="grid-container">
    <a href="docentes.php" class="card">
      <i class="fas fa-chalkboard-teacher"></i>
      <h3>Docentes</h3>
      <p>Gestión de docentes y perfiles.</p>
    </a>
    <a href="salones.html" class="card">
      <i class="fas fa-school"></i>
      <h3>Salones</h3>
      <p>Administración de salones y espacios.</p>
    </a>
    <a href="orientaciones.html" class="card">
      <i class="fas fa-book"></i>
      <h3>Orientaciones</h3>
      <p>Información de orientaciones disponibles.</p>
    </a>
    <a href="casos.html" class="card">
      <i class="fas fa-user-shield"></i>
      <h3>Casos Especiales</h3>
      <p>Gestión de situaciones particulares.</p>
    </a>
    <a href="extra1.html" class="card">
      <i class="fas fa-cogs"></i>
      <h3>Extra 1</h3>
      <p>Sección adicional configurable.</p>
    </a>
    <a href="extra2.html" class="card">
      <i class="fas fa-folder-open"></i>
      <h3>Extra 2</h3>
      <p>Sección adicional configurable.</p>
    </a>
  </main>

  <script src="script.js"></script>
</body>
</html>
