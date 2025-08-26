const horarios = [7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,0];
const salones = Array.from({length: 40}, (_, i) => `Salón ${i+1}`);
let profesores = [];
let asignaciones = {}; // clave: `${salon}-${hora}`

// Elementos DOM
const tabla = document.getElementById("tablaHorarios");
const tbody = tabla.querySelector("tbody");
const agregarBtn = document.getElementById("agregarProfesor");
const nombreInput = document.getElementById("nombre");
const asignaturaInput = document.getElementById("asignatura");
const anioSelect = document.getElementById("anio");

const filtroAnio = document.getElementById("filtroAnio");
const filtroAsignatura = document.getElementById("filtroAsignatura");

const asignarProfesorBtn = document.getElementById("asignarProfesorBtn");
const exportarCSVBtn = document.getElementById("exportarCSVBtn");

const modal = document.getElementById("modal");
const listaProfesoresDiv = document.getElementById("listaProfesores");
const cerrarModalBtn = document.getElementById("cerrarModal");
const confirmarAsignacionBtn = document.getElementById("confirmarAsignacionBtn");

let celdasSeleccionadas = []; // array de keys (salon-hora)
let salonSeleccionado = null;  // salón seleccionado para la asignación

// Referencias nuevas
const archivoCSV = document.getElementById("archivoCSV");

// Renderiza tabla y encabezados
function renderTabla() {
  // Encabezados horarios
  const thead = tabla.querySelector("thead tr");
  thead.innerHTML = "<th>Salón</th>" + horarios.map(h => `<th>${h}:00</th>`).join("");

  tbody.innerHTML = "";

  salones.forEach(salon => {
    const fila = document.createElement("tr");
    fila.innerHTML = `<td>${salon}</td>` + horarios.map(hora => {
      const key = `${salon}-${hora}`;
      if (asignaciones[key]) {
        const { nombre, asignatura, anio } = asignaciones[key];
        return `<td class="ocupado" data-key="${key}">
                  <span class="btn-quitar" data-key="${key}" title="Quitar asignación">×</span>
                  <div>${nombre}</div>
                  <div>${asignatura}</div>
                  <div>${anio}</div>
                </td>`;
      } else {
        return `<td class="libre" data-salon="${salon}" data-hora="${hora}" data-key="${key}">
                  <span class="plus">+</span>
                </td>`;
      }
    }).join("");
    tbody.appendChild(fila);
  });
  attachEventosCeldas();
}

// Añade eventos click para selección múltiple en celdas libres y quitar asignación
function attachEventosCeldas() {
  salonSeleccionado = null;

  const celdasLibres = tbody.querySelectorAll("td.libre");
  celdasLibres.forEach(td => {
    td.classList.remove("seleccionado");
    td.onclick = () => {
      const salon = td.dataset.salon;
      const hora = td.dataset.hora;
      const key = td.dataset.key;

      if (!salonSeleccionado) {
        salonSeleccionado = salon;
      }

      if (salon !== salonSeleccionado) {
        alert("Selecciona solo celdas del mismo salón.");
        return;
      }

      if (celdasSeleccionadas.includes(key)) {
        celdasSeleccionadas = celdasSeleccionadas.filter(k => k !== key);
        td.classList.remove("seleccionado");
      } else {
        celdasSeleccionadas.push(key);
        td.classList.add("seleccionado");
      }

      asignarProfesorBtn.disabled = celdasSeleccionadas.length === 0;
    };
  });

  // Evento quitar asignación
  const btnsQuitar = tbody.querySelectorAll(".btn-quitar");
  btnsQuitar.forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      const key = btn.dataset.key;
      delete asignaciones[key];
      renderTabla();
    };
  });
}

// Función para filtrar profesores según filtros seleccionados
function filtrarProfesores() {
  const anioF = filtroAnio.value.trim();
  const asignaturaF = filtroAsignatura.value.trim().toLowerCase();

  return profesores.filter(p => {
    const cumpleAnio = anioF === "" || p.anio === anioF;
    const cumpleAsignatura = asignaturaF === "" || p.asignatura.toLowerCase().includes(asignaturaF);
    return cumpleAnio && cumpleAsignatura;
  });
}

// Renderiza la lista de profesores filtrada en el modal
function renderListaProfesores() {
  const filtrados = filtrarProfesores();
  if(filtrados.length === 0) {
    listaProfesoresDiv.innerHTML = "<em>No hay profesores que coincidan con el filtro.</em>";
    confirmarAsignacionBtn.disabled = true;
    return;
  }
  listaProfesoresDiv.innerHTML = filtrados.map((p, i) =>
    `<div class="prof-item" data-index="${i}">${p.nombre} - ${p.asignatura} (${p.anio})</div>`
  ).join("");
  attachEventosProfesores();
}

// Actualiza lista profesores al cambiar filtros dentro del modal
filtroAnio.onchange = renderListaProfesores;
filtroAsignatura.oninput = renderListaProfesores;

// Adjunta evento click para seleccionar profesor en modal
function attachEventosProfesores() {
  const profItems = listaProfesoresDiv.querySelectorAll(".prof-item");
  profItems.forEach(item => {
    item.onclick = () => {
      profItems.forEach(i => i.classList.remove("seleccionado"));
      item.classList.add("seleccionado");
      confirmarAsignacionBtn.disabled = false;
    };
  });
}

// Mostrar modal y preparar lista profesores filtrada
function abrirModal() {
  renderListaProfesores();
  modal.style.display = "flex";
  confirmarAsignacionBtn.disabled = true;
}

// Cerrar modal y limpiar selección
const btnCerrarModal = document.getElementById("cerrarModal");

btnCerrarModal.addEventListener("click", cerrarModal);

function cerrarModal() {
  modal.style.display = "none";
  limpiarSeleccion();
}

function cerrarModal() {
  modal.style.display = "none";
  limpiarSeleccion();
}

window.addEventListener("click", function (e) {
  if (e.target === modal) {
    cerrarModal();
  }
});


// Limpia selección de celdas y botón
function limpiarSeleccion() {
  celdasSeleccionadas = [];
  salonSeleccionado = null;
  asignarProfesorBtn.disabled = true;
  const celdas = tbody.querySelectorAll("td.seleccionado");
  celdas.forEach(td => td.classList.remove("seleccionado"));
}

// Asignar profesor seleccionado a todas las celdas marcadas
confirmarAsignacionBtn.onclick = () => {
  const seleccionado = listaProfesoresDiv.querySelector(".prof-item.seleccionado");
  if (!seleccionado) {
    alert("Por favor selecciona un profesor.");
    return;
  }
  const index = [...listaProfesoresDiv.children].indexOf(seleccionado);
  // Los profesores filtrados:
  const filtrados = filtrarProfesores();
  const profesor = filtrados[index];

  celdasSeleccionadas.forEach(key => {
    asignaciones[key] = profesor;
  });

  cerrarModal();
  renderTabla();
};

// Botón para abrir modal asignar profesor a celdas seleccionadas
asignarProfesorBtn.onclick = () => {
  if (celdasSeleccionadas.length === 0) return;
  abrirModal();
};

// Botón exportar tabla a CSV
exportarCSVBtn.onclick = () => {
  let csvContent = "data:text/csv;charset=utf-8,";
  // Cabecera
  csvContent += "Salón," + horarios.map(h => `${h}:00`).join(",") + "\n";
  salones.forEach(salon => {
    let fila = [salon];
    horarios.forEach(hora => {
      const key = `${salon}-${hora}`;
      if (asignaciones[key]) {
        const a = asignaciones[key];
        fila.push(`"${a.nombre} - ${a.asignatura} - ${a.anio}"`);
      } else {
        fila.push("Libre");
      }
    });
    csvContent += fila.join(",") + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "tabla_salones.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Función para agregar profesor (reutilizable)
function agregarProfesor(nombre, asignatura, anio) {
  if (!nombre || !asignatura) return false;
  profesores.push({ nombre, asignatura, anio });
  return true;
}

// Manejo botón agregar profesor (original)
agregarBtn.onclick = () => {
  const nombre = nombreInput.value.trim();
  const asignatura = asignaturaInput.value.trim();
  const anio = anioSelect.value;

  if (!nombre || !asignatura) {
    alert("Por favor completa nombre y asignatura.");
    return;
  }

  if (agregarProfesor(nombre, asignatura, anio)) {
    alert(`Profesor ${nombre} agregado.`);
    nombreInput.value = "";
    asignaturaInput.value = "";
    renderTabla();
  }
};

// Guardar automáticamente al presionar Enter en cualquiera de los inputs del formulario
[nombreInput, asignaturaInput, anioSelect].forEach(el => {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      agregarBtn.click();
    }
  });
});

// Función para leer CSV
function leerCSV(texto) {
  // Se espera formato: nombre, asignatura, año (en cada línea)
  const lineas = texto.trim().split(/\r?\n/);
  let agregados = 0;
  lineas.forEach(linea => {
    const partes = linea.split(",").map(s => s.trim());
    if (partes.length >= 3) {
      const [nombre, asignatura, anio] = partes;
      if (["1°","2°","3°","4°"].includes(anio) && nombre && asignatura) {
        if (agregarProfesor(nombre, asignatura, anio)) {
          agregados++;
        }
      }
    }
  });
  alert(`Se agregaron ${agregados} profesores desde el archivo.`);
  renderTabla();
}

// Manejar carga archivo CSV
archivoCSV.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const texto = evt.target.result;
    leerCSV(texto);
    archivoCSV.value = ""; // para permitir cargar el mismo archivo otra vez si se desea
  };
  reader.readAsText(file);
});

// Actualiza la hora en el header
function actualizarHora() {
    const el = document.getElementById('horaActual');
    if (el) {
        const ahora = new Date();
        el.textContent = ahora.toLocaleTimeString();
    }
}
setInterval(actualizarHora, 1000);
actualizarHora();

// Ejemplo: agregar profesor a una lista interna y actualizar la tabla
document.getElementById('agregarProfesor').onclick = function() {
    const nombre = document.getElementById('nombre').value.trim();
    const asignatura = document.getElementById('asignatura').value.trim();
    const anio = document.getElementById('anio').value;
    if (nombre && asignatura && anio) {
        profesores.push({ nombre, asignatura, anio });
        document.getElementById('nombre').value = '';
        document.getElementById('asignatura').value = '';
        actualizarListaProfesores();
    }
};

function actualizarListaProfesores() {
    const lista = document.getElementById('listaProfesores');
    if (!lista) return;
    lista.innerHTML = '';
    profesores.forEach((prof, idx) => {
        const div = document.createElement('div');
        div.className = 'profesor-item';
        div.textContent = `${prof.nombre} - ${prof.asignatura} (${prof.anio})`;
        lista.appendChild(div);
    });
}

// Modal de asignación (ejemplo básico)
document.getElementById('asignarProfesorBtn').onclick = function() {
    document.getElementById('modal').style.display = 'block';
    actualizarListaProfesores();
};
document.getElementById('cerrarModal').onclick = function() {
    document.getElementById('modal').style.display = 'none';
};

// Exportar tabla a CSV (ejemplo simple)
document.getElementById('exportarCSVBtn').onclick = function() {
    const tabla = document.getElementById('tablaHorarios');
    let csv = [];
    for (let row of tabla.rows) {
        let cols = [];
        for (let cell of row.cells) {
            cols.push(cell.innerText.replace(/"/g, '""'));
        }
        csv.push('"' + cols.join('","') + '"');
    }
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'salonario.csv';
    a.click();
};

// Opcional: cargar profesores desde CSV
document.getElementById('archivoCSV').onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        const lines = evt.target.result.split('\n');
        lines.forEach(line => {
            const [nombre, asignatura, anio] = line.split(',');
            if (nombre && asignatura && anio) {
                profesores.push({ nombre: nombre.trim(), asignatura: asignatura.trim(), anio: anio.trim() });
            }
        });
        actualizarListaProfesores();
    };
    reader.readAsText(file);
};

