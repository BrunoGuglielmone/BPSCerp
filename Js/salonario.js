// === ESTADO DE LA APLICACIÓN (se cargará desde la API) ===
let horarios = [];
let salones = [];
let profesores = [];
let asignaciones = {}; // { "2025-09-02": { "1-2": {profesor...} }, ... }
let selectedDate;
let celdasSeleccionadas = [];
let salonSeleccionado = null;

// === ELEMENTOS DOM (sin cambios) ===
const tabla = document.getElementById("tablaHorarios");
const tbody = tabla.querySelector("tbody");
const agregarBtn = document.getElementById("agregarProfesor");
const nombreInput = document.getElementById("nombre");
const asignaturaInput = document.getElementById("asignatura");
const anioSelect = document.getElementById("anio");
const modal = document.getElementById("modal");
const listaProfesoresDiv = document.getElementById("listaProfesores");
const cerrarModalBtn = document.getElementById("cerrarModal");
const confirmarAsignacionBtn = document.getElementById("confirmarAsignacionBtn");
const filtroAnio = document.getElementById("filtroAnio");
const filtroAsignatura = document.getElementById("filtroAsignatura");
const asignarProfesorBtn = document.getElementById("asignarProfesorBtn");
const exportarCSVBtn = document.getElementById("exportarCSVBtn");
const toggleFormularioBtn = document.getElementById("toggleFormulario");
const contenidoFormulario = document.getElementById("contenidoFormulario");
const toggleIcon = toggleFormularioBtn.querySelector('i');
const fechaInput = document.getElementById("fechaInput");
const primerSemestreBtn = document.getElementById("primerSemestreBtn");
const segundoSemestreBtn = document.getElementById("segundoSemestreBtn");

// === FUNCIONES DE API ===

// Carga todos los datos iniciales (salones, horarios, profesores) y las asignaciones del día
async function cargarDatos(fecha) {
    try {
        const response = await fetch(`/BPSCERP/api/get_datos.php?fecha=${fecha}`);
        if (!response.ok) throw new Error('Error en la red al cargar datos.');
        const data = await response.json();

        // Guardar datos globales
        salones = data.salones;
        horarios = data.horarios;
        profesores = data.profesores;

        // Limpiar asignaciones anteriores y cargar las nuevas
        asignaciones = {};
        asignaciones[fecha] = data.asignaciones;

        renderTabla();
    } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        alert("No se pudieron cargar los datos del servidor. Revise la consola.");
    }
}

// Envía una asignación (guardar o quitar) al servidor
async function manejarAsignacionAPI(payload) {
    try {
        const response = await fetch('/BPSCERP/api/manejar_asignacion.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Error en la red al guardar.');
        const result = await response.json();

        if (result.error) {
            throw new Error(result.mensaje);
        }
        console.log("Respuesta del servidor:", result.mensaje);
        return true;
    } catch (error) {
        console.error("Error en la operación de asignación:", error);
        alert(`Error: ${error.message}`);
        return false;
    }
}

// Agrega un nuevo profesor a la base de datos
async function agregarProfesorAPI() {
    const nombre = nombreInput.value.trim();
    const asignatura = asignaturaInput.value.trim();
    const anio = anioSelect.value;
    if (!nombre || !asignatura) return alert("Completa nombre y asignatura.");

    try {
        const response = await fetch('/BPSCERP/api/agregar_profesor.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, asignatura, anio })
        });
        if (!response.ok) throw new Error('Error en la red al agregar profesor.');
        const result = await response.json();

        if (result.error) {
            throw new Error(result.mensaje);
        }

        // Actualizar la lista local de profesores y limpiar el formulario
        profesores.push(result.profesor);
        alert(`Profesor ${nombre} agregado con éxito.`);
        nombreInput.value = "";
        asignaturaInput.value = "";

    } catch (error) {
        console.error("Error al agregar profesor:", error);
        alert(`Error: ${error.message}`);
    }
}


// === LÓGICA DE RENDERIZADO Y EVENTOS ===

// Dibuja la tabla con los datos actuales
function renderTabla() {
    if (!selectedDate || salones.length === 0 || horarios.length === 0) return;

    const asignacionesDelDia = asignaciones[selectedDate] || {};

    const thead = tabla.querySelector("thead tr");
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
                            <div>${asignacion.anio}</div>
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

// Asigna eventos a las celdas de la tabla
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
                // Actualizar estado local y re-renderizar
                const key = `${salon_id}-${horario_id}`;
                if (asignaciones[selectedDate]) {
                    delete asignaciones[selectedDate][key];
                }
                renderTabla();
            }
        };
    });
}

// Maneja la lógica de selección de celdas
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

// Asigna el profesor a las celdas seleccionadas
// Asigna el profesor a las celdas seleccionadas
confirmarAsignacionBtn.onclick = async () => {
    const seleccionado = listaProfesoresDiv.querySelector(".prof-item.seleccionado");
    if (!seleccionado) return alert("Por favor selecciona un profesor.");

    const profesor_id = seleccionado.dataset.profesorId;
    
    // Encuentra el objeto completo del profesor en nuestro estado local
    const profesor = profesores.find(p => p.id == profesor_id);
    if (!profesor) {
        alert("Error: No se encontró el profesor seleccionado.");
        return;
    }

    // Si no hay objeto de asignaciones para la fecha, lo creamos
    if (!asignaciones[selectedDate]) {
        asignaciones[selectedDate] = {};
    }

    // Preparamos un objeto con la información a mostrar en la celda
    const infoAsignacion = {
        docente_id: profesor.id,
        nombre: profesor.nombre_completo, // Usamos el nombre completo desde la API
        asignatura: profesor.asignatura,
        anio: profesor.ano_cursado
    };
    
    let huboError = false;

    // Iteramos sobre cada celda seleccionada para enviar la petición a la API
    for (const key of celdasSeleccionadas) {
        const [salon_id, horario_id] = key.split('-');
        const payload = { 
            accion: 'guardar', 
            fecha: selectedDate, 
            salon_id, 
            horario_id, 
            profesor_id 
        };
        const exito = await manejarAsignacionAPI(payload);
        if (exito) {
            // Si la API confirma, actualizamos el estado local para esa celda
            asignaciones[selectedDate][key] = { ...infoAsignacion };
        } else {
            huboError = true;
            // Si una falla, detenemos el proceso para no sobrecargar con errores
            break; 
        }
    }
    
    cerrarModal();
    renderTabla(); // Re-renderizamos la tabla con los datos locales actualizados

    if (!huboError) {
        alert("Asignaciones guardadas correctamente.");
    }
};

// === EVENT LISTENERS ===

// Inicialización de la página
document.addEventListener('DOMContentLoaded', () => {
    selectedDate = toYYYYMMDD(new Date());
    fechaInput.value = selectedDate;
    cargarDatos(selectedDate); // Carga inicial
    actualizarHora();

    // Configuración del formulario desplegable
    contenidoFormulario.classList.remove('show');
    toggleIcon.classList.add('fa-chevron-down');
    toggleIcon.classList.remove('fa-chevron-up');
});

// Cambios de fecha
fechaInput.addEventListener("change", () => {
    selectedDate = fechaInput.value;
    cargarDatos(selectedDate);
});

primerSemestreBtn.addEventListener("click", () => {
    const fecha = new Date(new Date().getFullYear(), 3, 1);
    fechaInput.value = toYYYYMMDD(fecha);
    fechaInput.dispatchEvent(new Event('change'));
});

segundoSemestreBtn.addEventListener("click", () => {
    const fecha = new Date(new Date().getFullYear(), 7, 1);
    fechaInput.value = toYYYYMMDD(fecha);
    fechaInput.dispatchEvent(new Event('change'));
});

// Botón de agregar profesor
agregarBtn.addEventListener("click", agregarProfesorAPI);


// === FUNCIONES AUXILIARES (Modal, Filtros, etc.) ===

function toYYYYMMDD(date) {
    return date.toISOString().split('T')[0];
}

function limpiarSeleccion() {
    tbody.querySelectorAll("td.seleccionado").forEach(td => td.classList.remove("seleccionado"));
    celdasSeleccionadas = [];
    salonSeleccionado = null;
    asignarProfesorBtn.disabled = true;
}

function renderListaProfesores() {
    const filtrados = filtrarProfesores();
    listaProfesoresDiv.innerHTML = ""; // Limpiar antes de renderizar
    
    if (filtrados.length === 0) {
        listaProfesoresDiv.innerHTML = "<em>No hay profesores que coincidan con el filtro.</em>";
        confirmarAsignacionBtn.disabled = true;
        return;
    }

    // Usamos 'nombre_completo' y 'ano_cursado' que vienen de la API
    filtrados.forEach(p => {
        const item = document.createElement('div');
        item.className = 'prof-item';
        item.dataset.profesorId = p.id;
        item.textContent = `${p.nombre_completo} - ${p.asignatura} (${p.ano_cursado}º Año)`;
        item.onclick = () => {
            // Gestionar la clase 'seleccionado'
            const actualSeleccionado = listaProfesoresDiv.querySelector(".prof-item.seleccionado");
            if (actualSeleccionado) {
                actualSeleccionado.classList.remove("seleccionado");
            }
            item.classList.add("seleccionado");
            confirmarAsignacionBtn.disabled = false;
        };
        listaProfesoresDiv.appendChild(item);
    });
}

function filtrarProfesores() {
    const anioF = filtroAnio.value.trim();
    const asignaturaF = filtroAsignatura.value.trim().toLowerCase();
    return profesores.filter(p => (anioF === "" || p.anio === anioF) && (asignaturaF === "" || p.asignatura.toLowerCase().includes(asignaturaF)));
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

function actualizarHora() {
    const el = document.getElementById('horaActual');
    if (el) el.textContent = new Date().toLocaleTimeString();
}

// Asignaciones finales de eventos
filtroAnio.onchange = renderListaProfesores;
filtroAsignatura.oninput = renderListaProfesores;
cerrarModalBtn.onclick = cerrarModal;
window.onclick = e => { if (e.target === modal) cerrarModal(); };
asignarProfesorBtn.onclick = () => { if (celdasSeleccionadas.length > 0) abrirModal(); };
toggleFormularioBtn.onclick = () => {
    contenidoFormulario.classList.toggle('show');
    toggleIcon.classList.toggle('fa-chevron-down');
    toggleIcon.classList.toggle('fa-chevron-up');
};
setInterval(actualizarHora, 1000);
