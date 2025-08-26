<?php include_once("../Php/header.php"); ?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Administración de Salones</title>
  <link rel="stylesheet" href="../estilos/estilosalonario.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>


<main>
  <section class="formulario">
    <h2>Agregar Profesor</h2>
    <input type="text" id="nombre" placeholder="Nombre y Apellido" />
    <input type="text" id="asignatura" placeholder="Asignatura" />
    <select id="anio">
      <option value="1°">1°</option>
      <option value="2°">2°</option>
      <option value="3°">3°</option>
      <option value="4°">4°</option>
    </select>
    <button id="agregarProfesor">Agregar</button>

    <div style="margin-top:2px;">
      <label for="archivoCSV" style="font-size:14px; cursor:pointer; color:#0077cc;">📂 Cargar profesores desde CSV</label>
      <input type="file" id="archivoCSV" accept=".csv" style="display:none;" />
    </div>
  </section>

  <section class="tabla-container">
    <button id="asignarProfesorBtn" disabled>Asignar profesor a seleccionadas</button>
    <button id="exportarCSVBtn">Exportar tabla a CSV</button>
    <table id="tablaHorarios">
      <thead>
        <tr><th>Salón</th></tr>
      </thead>
      <tbody></tbody>
    </table>
  </section>
</main>

<!-- Modal para elegir profesor -->
<div id="modal" class="modal">
  <div class="modal-content">
    <span id="cerrarModal" class="cerrar">&times;</span>
    <h3>Seleccionar Profesor</h3>
    <div class="modal-filtros">
      <label>Año:
        <select id="filtroAnio">
          <option value="">Todos</option>
          <option value="1°">1°</option>
          <option value="2°">2°</option>
          <option value="3°">3°</option>
          <option value="4°">4°</option>
        </select>
      </label>
      <label>Asignatura:
        <input type="text" id="filtroAsignatura" placeholder="Filtrar por asignatura" />
      </label>
    </div>
    <div id="listaProfesores"></div>
    <button id="confirmarAsignacionBtn" disabled>Confirmar asignación</button>
  </div>
</div>

<script src="../js/salonario.js"></script>
<?php include_once("../Php/footer.php"); ?>

</body>
</html>
