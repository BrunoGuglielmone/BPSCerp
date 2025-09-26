// === ESTADO DE LA APLICACIÓN ===
let horarios = [];
let salones = [];
let profesores = [];
let asignaciones = {};
let selectedDate;
let celdasSeleccionadas = [];
let salonSeleccionado = null;

// === ELEMENTOS DOM ===
const tabla = document.getElementById("tablaHorarios");
const tbody = tabla.querySelector("tbody");
const modal = document.getElementById("modal");
const listaProfesoresDiv = document.getElementById("listaProfesores");
const cerrarModalBtn = document.getElementById("cerrarModal");
const confirmarAsignacionBtn = document.getElementById("confirmarAsignacionBtn");
const filtroAnio = document.getElementById("filtroAnio");
const filtroAsignatura = document.getElementById("filtroAsignatura");
const asignarProfesorBtn = document.getElementById("asignarProfesorBtn");
const exportarCSVBtn = document.getElementById("exportarCSVBtn");
const fechaInput = document.getElementById("fechaInput");
const primerSemestreBtn = document.getElementById("primerSemestreBtn");
const segundoSemestreBtn = document.getElementById("segundoSemestreBtn");

// === FUNCIONES DE API ===

async function cargarDatos(fecha) {
    try {
        const response = await fetch(`../api/get_datos.php?fecha=${fecha}`);
        if (!response.ok) throw new Error('Error en la red al cargar datos.');
        const data = await response.json();

        salones = data.salones || [];
        horarios = data.horarios || [];
        profesores = data.docentes || [];

        asignaciones = {};
        asignaciones[fecha] = data.asignaciones || {};

        renderTabla();
    } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        alert("No se pudieron cargar los datos del servidor. Revise la consola.");
        const thead = tabla.querySelector("thead tr");
        thead.innerHTML = "<th>Error</th>";
        tbody.innerHTML = `<tr><td>No se pudieron cargar los datos. Verifique la conexión y la consola de errores (F12).</td></tr>`;
    }
}

async function manejarAsignacionAPI(payload) {
    try {
        const response = await fetch('../api/manejar_asignaciones.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Error en la red al guardar.');
        const result = await response.json();

        if (result.error) throw new Error(result.mensaje);
        
        console.log("Respuesta del servidor:", result.mensaje);
        return true;
    } catch (error) {
        console.error("Error en la operación de asignación:", error);
        alert(`Error: ${error.message}`);
        return false;
    }
}

// === LÓGICA DE RENDERIZADO Y EVENTOS ===

function renderTabla() {
    const thead = tabla.querySelector("thead tr");

    if (!selectedDate) {
        thead.innerHTML = "<th>Aviso</th>";
        tbody.innerHTML = '<tr><td>Por favor, seleccione una fecha para ver los horarios.</td></tr>';
        return;
    }
    
    // ✨ MEJORA: Muestra un mensaje si no hay salones u horarios registrados.
    if (salones.length === 0 || horarios.length === 0) {
        thead.innerHTML = "<th>Aviso</th>";
        tbody.innerHTML = '<tr><td>No hay salones u horarios registrados en el sistema. Por favor, agréguelos desde el panel de administración para poder continuar.</td></tr>';
        return;
    }

    const asignacionesDelDia = asignaciones[selectedDate] || {};
    thead.innerHTML = "<th>Salón</th>" + horarios.map(h => `<th>${h.hora}:00</th>`).join("");
    tbody.innerHTML = "";
    
    salones.forEach(salon => {
        const fila = document.createElement("tr");
        const celdasHorario = horarios.map(hora => {
            const key = `${salon.id}-${hora.id}`;
            const asignacion = asignacionesDelDia[key];
            if (asignacion) {
                return `<td class="ocupado" data-salon-id="${salon.id}" data-horario-id="${hora.id}">
                            <span class="btn-quitar" title="Quitar asignación">×</span>
                            <div>${asignacion.nombre}</div>
                            <div>${asignacion.asignatura}</div>
                            <div>${asignacion.anio}º Año</div>
                        </td>`;
            } else {
                return `<td class="libre" data-salon-id="${salon.id}" data-horario-id="${hora.id}">
                            <span class="plus">+</span>
                        </td>`;
            }
        }).join("");
        fila.innerHTML = `<td>${salon.nombre}</td>${celdasHorario}`;
        tbody.appendChild(fila);
    });
    attachEventosCeldas();
}

function attachEventosCeldas() {
    limpiarSeleccion();
    tbody.querySelectorAll("td.libre").forEach(td => {
        td.onclick = () => manejarSeleccionCelda(td);
    });
    tbody.querySelectorAll(".btn-quitar").forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const celda = btn.closest('td');
            const salon_id = celda.dataset.salonId;
            const horario_id = celda.dataset.horarioId;
            const payload = { accion: 'quitar', fecha: selectedDate, salon_id, horario_id };
            const exito = await manejarAsignacionAPI(payload);
            if (exito) {
                const key = `${salon_id}-${horario_id}`;
                if (asignaciones[selectedDate]) delete asignaciones[selectedDate][key];
                renderTabla();
            }
        };
    });
}

function manejarSeleccionCelda(td) {
    const salonId = td.dataset.salonId;
    const key = `${salonId}-${td.dataset.horarioId}`;
    if (celdasSeleccionadas.length > 0 && salonId !== salonSeleccionado) {
        alert("Solo puedes seleccionar celdas del mismo salón.");
        return;
    }
    if (celdasSeleccionadas.length === 0) salonSeleccionado = salonId;
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

confirmarAsignacionBtn.onclick = async () => {
    const seleccionado = listaProfesoresDiv.querySelector(".prof-item.seleccionado");
    if (!seleccionado) return alert("Por favor selecciona un profesor.");
    const profesor_id = seleccionado.dataset.profesorId;
    const profesor = profesores.find(p => p.id == profesor_id);
    if (!profesor) return alert("Error: No se encontró el profesor seleccionado.");
    if (!asignaciones[selectedDate]) asignaciones[selectedDate] = {};

    const infoAsignacion = {
        docente_id: profesor.id,
        nombre: profesor.nombre_completo,
        asignatura: profesor.asignatura,
        anio: profesor.ano_cursado
    };
    
    let huboError = false;
    for (const key of celdasSeleccionadas) {
        const [salon_id, horario_id] = key.split('-');
        const payload = { accion: 'guardar', fecha: selectedDate, salon_id, horario_id, profesor_id };
        const exito = await manejarAsignacionAPI(payload);
        if (exito) {
            asignaciones[selectedDate][key] = { ...infoAsignacion };
        } else {
            huboError = true;
            break; 
        }
    }
    cerrarModal();
    renderTabla();
    if (!huboError) alert("Asignaciones guardadas correctamente.");
};

// === EVENT LISTENERS y FUNCIONES AUXILIARES ===
document.addEventListener('DOMContentLoaded', () => {
    selectedDate = toYYYYMMDD(new Date());
    fechaInput.value = selectedDate;
    cargarDatos(selectedDate);
});
fechaInput.addEventListener("change", () => {
    selectedDate = fechaInput.value;
    cargarDatos(selectedDate);
});
primerSemestreBtn.addEventListener("click", () => {
    const fecha = new Date(new Date().getFullYear(), 2, 1); // Marzo
    fechaInput.value = toYYYYMMDD(fecha);
    fechaInput.dispatchEvent(new Event('change'));
});
segundoSemestreBtn.addEventListener("click", () => {
    const fecha = new Date(new Date().getFullYear(), 7, 1); // Agosto
    fechaInput.value = toYYYYMMDD(fecha);
    fechaInput.dispatchEvent(new Event('change'));
});

function toYYYYMMDD(date) { return date.toISOString().split('T')[0]; }

function limpiarSeleccion() {
    tbody.querySelectorAll("td.seleccionado").forEach(td => td.classList.remove("seleccionado"));
    celdasSeleccionadas = [];
    salonSeleccionado = null;
    asignarProfesorBtn.disabled = true;
}

function renderListaProfesores() {
    const filtrados = filtrarProfesores();
    listaProfesoresDiv.innerHTML = "";
    if (filtrados.length === 0) {
        listaProfesoresDiv.innerHTML = "<em>No hay docentes que coincidan con el filtro.</em>";
        confirmarAsignacionBtn.disabled = true;
        return;
    }
    filtrados.forEach(p => {
        const item = document.createElement('div');
        item.className = 'prof-item';
        item.dataset.profesorId = p.id;
        item.textContent = `${p.nombre_completo} - ${p.asignatura} (${p.ano_cursado}º Año)`;
        item.onclick = () => {
            const actual = listaProfesoresDiv.querySelector(".prof-item.seleccionado");
            if (actual) actual.classList.remove("seleccionado");
            item.classList.add("seleccionado");
            confirmarAsignacionBtn.disabled = false;
        };
        listaProfesoresDiv.appendChild(item);
    });
}

function filtrarProfesores() {
    const anioF = filtroAnio.value;
    const asignaturaF = filtroAsignatura.value.trim().toLowerCase();
    return profesores.filter(p => 
        (anioF === "" || p.ano_cursado == anioF) && 
        (asignaturaF === "" || p.asignatura.toLowerCase().includes(asignaturaF))
    );
}

function abrirModal() { renderListaProfesores(); modal.style.display = "flex"; confirmarAsignacionBtn.disabled = true; }
function cerrarModal() { modal.style.display = "none"; limpiarSeleccion(); }

filtroAnio.onchange = renderListaProfesores;
filtroAsignatura.oninput = renderListaProfesores;
cerrarModalBtn.onclick = cerrarModal;
window.onclick = e => { if (e.target === modal) cerrarModal(); };
asignarProfesorBtn.onclick = () => { if (celdasSeleccionadas.length > 0) abrirModal(); };