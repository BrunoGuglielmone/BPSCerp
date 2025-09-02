// === ESTADO DE LA APLICACIÓN ===
const horarios = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0];
const salones = Array.from({ length: 40 }, (_, i) => `Salón ${i + 1}`);
let profesores = [];
let asignaciones = {}; // { fecha: { "Salon-Hora": {profesor} } }
let selectedDate;
let celdasSeleccionadas = [];
let salonSeleccionado = null;

// === ELEMENTOS DOM ===
const tabla = document.getElementById("tablaHorarios");
const tbody = tabla.querySelector("tbody");
// Formulario
const agregarBtn = document.getElementById("agregarProfesor");
const nombreInput = document.getElementById("nombre");
const asignaturaInput = document.getElementById("asignatura");
const anioSelect = document.getElementById("anio");
// Modal asignar
const modal = document.getElementById("modal");
const listaProfesoresDiv = document.getElementById("listaProfesores");
const cerrarModalBtn = document.getElementById("cerrarModal");
const confirmarAsignacionBtn = document.getElementById("confirmarAsignacionBtn");
const filtroAnio = document.getElementById("filtroAnio");
const filtroAsignatura = document.getElementById("filtroAsignatura");
// Controles tabla
const asignarProfesorBtn = document.getElementById("asignarProfesorBtn");
const exportarCSVBtn = document.getElementById("exportarCSVBtn");
// Formulario desplegable
const toggleFormularioBtn = document.getElementById("toggleFormulario");
const contenidoFormulario = document.getElementById("contenidoFormulario");
const toggleIcon = toggleFormularioBtn.querySelector("i");
// Calendario
const fechaInput = document.getElementById("fechaInput");
const primerSemestreBtn = document.getElementById("primerSemestreBtn");
const segundoSemestreBtn = document.getElementById("segundoSemestreBtn");

// === NUEVO MODAL DETALLE ===
const modalDetalle = document.createElement("div");
modalDetalle.classList.add("modal");
modalDetalle.innerHTML = `
  <div class="modal-content">
    <span id="cerrarModalDetalle" class="cerrar">&times;</span>
    <h3>Detalles de la asignación</h3>
    <div id="detalleContenido"></div>
    <div class="acciones-detalle">
        <button id="verProfesorBtn">Ver Profesor</button>
        <button id="verSalonBtn">Ver Salón</button>
    </div>
  </div>
`;
document.body.appendChild(modalDetalle);

const cerrarModalDetalle = modalDetalle.querySelector("#cerrarModalDetalle");
const detalleContenido = modalDetalle.querySelector("#detalleContenido");
const verProfesorBtn = modalDetalle.querySelector("#verProfesorBtn");
const verSalonBtn = modalDetalle.querySelector("#verSalonBtn");

cerrarModalDetalle.onclick = () => (modalDetalle.style.display = "none");
window.addEventListener("click", e => {
    if (e.target === modalDetalle) modalDetalle.style.display = "none";
});

// === FUNCIONES ===
function toYYYYMMDD(date) {
    return date.toISOString().split("T")[0];
}

function renderTabla() {
    if (!selectedDate) return;
    const asignacionesDelDia = asignaciones[selectedDate] || {};

    const thead = tabla.querySelector("thead tr");
    thead.innerHTML =
        "<th>Salón</th>" +
        horarios.map(h => `<th>${h}:00</th>`).join("");
    tbody.innerHTML = "";

    salones.forEach(salon => {
        const fila = document.createElement("tr");
        fila.innerHTML =
            `<td>${salon}</td>` +
            horarios
                .map(hora => {
                    const key = `${salon}-${hora}`;
                    if (asignacionesDelDia[key]) {
                        const { nombre, asignatura, anio } = asignacionesDelDia[key];
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
                })
                .join("");
        tbody.appendChild(fila);
    });

    attachEventosCeldas();
}

function attachEventosCeldas() {
    limpiarSeleccion();

    // Celdas libres
    tbody.querySelectorAll("td.libre").forEach(td => {
        td.onclick = () => manejarSeleccionCelda(td);
    });

    // Botón quitar → elimina TODAS las asignaciones de ese profesor en la fecha
    tbody.querySelectorAll(".btn-quitar").forEach(btn => {
        btn.onclick = e => {
            e.stopPropagation();
            const key = btn.dataset.key;
            const prof = asignaciones[selectedDate][key];
            if (!prof) return;

            for (const k in asignaciones[selectedDate]) {
                if (
                    asignaciones[selectedDate][k].nombre === prof.nombre &&
                    asignaciones[selectedDate][k].asignatura === prof.asignatura &&
                    asignaciones[selectedDate][k].anio === prof.anio
                ) {
                    delete asignaciones[selectedDate][k];
                }
            }

            renderTabla();
        };
    });

    // Click en casillas ocupadas → abre modal detalle
    tbody.querySelectorAll("td.ocupado").forEach(td => {
        td.onclick = () => {
            const key = td.dataset.key;
            const prof = asignaciones[selectedDate][key];
            if (!prof) return;

            detalleContenido.innerHTML = `
                <p><strong>Profesor:</strong> ${prof.nombre}</p>
                <p><strong>Asignatura:</strong> ${prof.asignatura}</p>
                <p><strong>Año:</strong> ${prof.anio}</p>
                <p><strong>Salón:</strong> ${key.split("-")[0]}</p>
                <p><strong>Hora:</strong> ${key.split("-")[1]}:00</p>
            `;

            verProfesorBtn.onclick = () => {
                window.location.href =
                    "profesor.php?nombre=" + encodeURIComponent(prof.nombre);
            };
            verSalonBtn.onclick = () => {
                const salon = key.split("-")[0];
                window.location.href =
                    "salon.php?nombre=" + encodeURIComponent(salon);
            };

            modalDetalle.style.display = "flex";
        };
    });
}

function manejarSeleccionCelda(td) {
    const salon = td.dataset.salon;
    const key = td.dataset.key;

    if (celdasSeleccionadas.length > 0 && salon !== salonSeleccionado) {
        alert("Solo puedes seleccionar celdas del mismo salón en una sola operación.");
        return;
    }

    if (celdasSeleccionadas.length === 0) salonSeleccionado = salon;

    const index = celdasSeleccionadas.indexOf(key);
    if (index > -1) {
        celdasSeleccionadas.splice(index, 1);
        td.classList.remove("seleccionado");
    } else {
        celdasSeleccionadas.push(key);
        td.classList.add("seleccionado");
    }

    if (celdasSeleccionadas.length === 0) salonSeleccionado = null;
    asignarProfesorBtn.disabled = celdasSeleccionadas.length === 0;
}

confirmarAsignacionBtn.onclick = () => {
    const seleccionado = listaProfesoresDiv.querySelector(".prof-item.seleccionado");
    if (!seleccionado) return alert("Por favor selecciona un profesor.");
    const index = parseInt(seleccionado.dataset.index, 10);
    const profesor = filtrarProfesores()[index];
    if (!asignaciones[selectedDate]) asignaciones[selectedDate] = {};
    celdasSeleccionadas.forEach(key => {
        asignaciones[selectedDate][key] = { ...profesor };
    });
    cerrarModal();
    renderTabla();
};

fechaInput.addEventListener("change", () => {
    selectedDate = fechaInput.value;
    renderTabla();
});
primerSemestreBtn.addEventListener("click", () => {
    const hoy = new Date();
    const primerSemestre = new Date(hoy.getFullYear(), 3, 1);
    fechaInput.value = toYYYYMMDD(primerSemestre);
    fechaInput.dispatchEvent(new Event("change"));
});
segundoSemestreBtn.addEventListener("click", () => {
    const hoy = new Date();
    const segundoSemestre = new Date(hoy.getFullYear(), 7, 1);
    fechaInput.value = toYYYYMMDD(segundoSemestre);
    fechaInput.dispatchEvent(new Event("change"));
});

document.addEventListener("DOMContentLoaded", () => {
    const hoy = new Date();
    selectedDate = toYYYYMMDD(hoy);
    fechaInput.value = selectedDate;
    renderTabla();
    actualizarHora();
    contenidoFormulario.classList.remove("show");
    toggleIcon.classList.remove("fa-chevron-up");
    toggleIcon.classList.add("fa-chevron-down");
});

// === FUNCIONES AUXILIARES ===
function limpiarSeleccion() {
    tbody.querySelectorAll("td.seleccionado").forEach(td =>
        td.classList.remove("seleccionado")
    );
    celdasSeleccionadas = [];
    salonSeleccionado = null;
    asignarProfesorBtn.disabled = true;
}
function filtrarProfesores() {
    const anioF = filtroAnio.value.trim();
    const asignaturaF = filtroAsignatura.value.trim().toLowerCase();
    return profesores.filter(
        p =>
            (anioF === "" || p.anio === anioF) &&
            (asignaturaF === "" ||
                p.asignatura.toLowerCase().includes(asignaturaF))
    );
}
function renderListaProfesores() {
    const filtrados = filtrarProfesores();
    if (filtrados.length === 0) {
        listaProfesoresDiv.innerHTML = "<em>No hay profesores que coincidan.</em>";
        confirmarAsignacionBtn.disabled = true;
        return;
    }
    listaProfesoresDiv.innerHTML = filtrados
        .map(
            (p, i) =>
                `<div class="prof-item" data-index="${i}">${p.nombre} - ${p.asignatura} (${p.anio})</div>`
        )
        .join("");
    listaProfesoresDiv.querySelectorAll(".prof-item").forEach(item => {
        item.onclick = () => {
            listaProfesoresDiv
                .querySelectorAll(".prof-item")
                .forEach(i => i.classList.remove("seleccionado"));
            item.classList.add("seleccionado");
            confirmarAsignacionBtn.disabled = false;
        };
    });
}
function abrirModal() {
    renderListaProfesores();
    modal.style.display = "flex";
    confirmarAsignacionBtn.disabled = true;
}
function cerrarModal() {
    modal.style.display = "none";
    limpiarSeleccion();
}
filtroAnio.onchange = renderListaProfesores;
filtroAsignatura.oninput = renderListaProfesores;
cerrarModalBtn.onclick = cerrarModal;
window.onclick = e => {
    if (e.target === modal) cerrarModal();
};
asignarProfesorBtn.onclick = () => {
    if (celdasSeleccionadas.length > 0) abrirModal();
};
toggleFormularioBtn.onclick = () => {
    contenidoFormulario.classList.toggle("show");
    toggleIcon.classList.toggle("fa-chevron-down");
    toggleIcon.classList.toggle("fa-chevron-up");
};
agregarBtn.onclick = () => {
    const nombre = nombreInput.value.trim();
    const asignatura = asignaturaInput.value.trim();
    const anio = anioSelect.value;
    if (!nombre || !asignatura)
        return alert("Completa nombre y asignatura.");
    profesores.push({ nombre, asignatura, anio });
    alert(`Profesor ${nombre} agregado.`);
    nombreInput.value = "";
    asignaturaInput.value = "";
};
function actualizarHora() {
    const el = document.getElementById("horaActual");
    if (el) el.textContent = new Date().toLocaleTimeString();
}
setInterval(actualizarHora, 1000);
