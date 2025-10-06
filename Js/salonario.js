// === ESTADO DE LA APLICACIÓN ===
let horarios = [], salones = [], profesores = [], asignaciones = {};
let selectedDate;
let celdasSeleccionadas = [];
let salonSeleccionado = null;
let configSemestre = {}; // Objeto para guardar las fechas del semestre cargadas desde la BD

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
const asignarSemestreBtn = document.getElementById("asignarSemestreBtn");
const fechaInput = document.getElementById("fechaInput"); // Calendario

// Elementos para la nueva funcionalidad
const semanaBotonesContainer = document.getElementById("semana-botones");
const configSemestreBtn = document.getElementById("configSemestreBtn");
const modalSemestre = document.getElementById("modalSemestre");
const cerrarModalSemestreBtn = document.getElementById("cerrarModalSemestre");
const guardarFechasSemestreBtn = document.getElementById("guardarFechasSemestreBtn");

// === FUNCIONES DE API ===

async function cargarDatos(fecha) {
    try {
        const response = await fetch(`../api/get_datos.php?fecha=${fecha}`);
        if (!response.ok) throw new Error('Error en la red al cargar datos.');
        const data = await response.json();

        salones = data.salones || [];
        horarios = data.horarios || [];
        profesores = data.docentes || [];
        configSemestre = data.configuracion || {}; // Guardamos la configuración de fechas
        asignaciones = {};
        asignaciones[fecha] = data.asignaciones || {};

        renderTabla();
    } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        alert("No se pudieron cargar los datos del servidor. Revise la consola.");
        const thead = tabla.querySelector("thead tr");
        thead.innerHTML = "<th>Error</th>";
        tbody.innerHTML = `<tr><td>No se pudieron cargar los datos. Verifique la conexión (F12).</td></tr>`;
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

// === LÓGICA DE RENDERIZADO Y MANEJO DE TABLA (Sin cambios mayores) ===

function renderTabla() {
    const thead = tabla.querySelector("thead tr");

    if (!selectedDate) {
        thead.innerHTML = "<th>Aviso</th>";
        tbody.innerHTML = '<tr><td>Por favor, seleccione una fecha para ver los horarios.</td></tr>';
        return;
    }
    
    if (salones.length === 0 || horarios.length === 0) {
        thead.innerHTML = "<th>Aviso</th>";
        tbody.innerHTML = '<tr><td>No hay salones u horarios registrados. Agréguelos desde administración.</td></tr>';
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
            if (confirm('¿Estás seguro de que deseas quitar esta asignación?')) {
                const payload = { accion: 'quitar', fecha: selectedDate, salon_id, horario_id };
                const exito = await manejarAsignacionAPI(payload);
                if (exito) {
                    const key = `${salon_id}-${horario_id}`;
                    if (asignaciones[selectedDate]) delete asignaciones[selectedDate][key];
                    renderTabla();
                }
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
    td.classList.toggle("seleccionado");
    
    if (td.classList.contains("seleccionado")) {
        celdasSeleccionadas.push(key);
    } else {
        const index = celdasSeleccionadas.indexOf(key);
        if (index > -1) celdasSeleccionadas.splice(index, 1);
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
        docente_id: profesor.id, nombre: profesor.nombre_completo,
        asignatura: profesor.asignatura, anio: profesor.ano_cursado
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

// === LÓGICA DE SINCRONIZACIÓN DE FECHAS ===

function toYYYYMMDD(date) { return date.toISOString().split('T')[0]; }

// Función principal para actualizar la vista a una nueva fecha
function actualizarVistaPorFecha(fechaStr) {
    if (!fechaStr) return; // Evitar errores si la fecha es inválida
    selectedDate = fechaStr;
    fechaInput.value = selectedDate;
    actualizarBotonesSemana(new Date(fechaStr + 'T12:00:00')); // Usar T12 para evitar problemas de zona horaria
    cargarDatos(selectedDate);
}

// Genera/Actualiza los botones para la semana de la fecha dada y resalta el día activo
function actualizarBotonesSemana(fechaDeReferencia) {
    const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const diaDeReferencia = fechaDeReferencia.getDay();
    const fechaActivaYYYYMMDD = toYYYYMMDD(fechaDeReferencia);

    const offset = (diaDeReferencia === 0 ? 6 : diaDeReferencia - 1); // Domingo es 0, Lunes es 1
    const lunesDeLaSemana = new Date(fechaDeReferencia);
    lunesDeLaSemana.setDate(fechaDeReferencia.getDate() - offset);
    
    semanaBotonesContainer.innerHTML = '';

    for (let i = 0; i < 6; i++) {
        const fechaDia = new Date(lunesDeLaSemana);
        fechaDia.setDate(lunesDeLaSemana.getDate() + i);
        const fechaFormato = toYYYYMMDD(fechaDia);
        
        const boton = document.createElement('button');
        boton.innerText = dias[i];
        boton.dataset.fecha = fechaFormato;

        if (fechaFormato === fechaActivaYYYYMMDD) {
            boton.classList.add('activo');
        }

        boton.addEventListener('click', () => {
            actualizarVistaPorFecha(boton.dataset.fecha);
        });

        semanaBotonesContainer.appendChild(boton);
    }
}

// === LÓGICA PARA ASIGNAR A TODO EL SEMESTRE (MEJORADA) ===
asignarSemestreBtn.onclick = async () => {
    const asignacionesDelDia = asignaciones[selectedDate];
    if (!asignacionesDelDia || Object.keys(asignacionesDelDia).length === 0) {
        return alert("No hay ninguna asignación en la fecha seleccionada para copiar.");
    }
    
    // Determinar a qué semestre pertenece la fecha seleccionada
    let semestreNumero = 0;
    if (selectedDate >= configSemestre.semestre1_inicio && selectedDate <= configSemestre.semestre1_fin) {
        semestreNumero = 1;
    } else if (selectedDate >= configSemestre.semestre2_inicio && selectedDate <= configSemestre.semestre2_fin) {
        semestreNumero = 2;
    }

    if (semestreNumero === 0) {
        return alert("La fecha seleccionada no pertenece a ningún semestre configurado. Por favor, ajuste las fechas en 'Configurar Semestres'.");
    }

    const semestreTexto = semestreNumero === 1 ? "primer" : "segundo";
    const diaSemana = new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long' });

    const confirmacion = confirm(
        `Esto copiará TODAS las asignaciones del día ${selectedDate} (${diaSemana}) a todos los ${diaSemana}s correspondientes del ${semestreTexto} semestre.\n\n¿Estás seguro? Esta acción es irreversible.`
    );

    if (!confirmacion) return;
    
    alert("Iniciando asignación masiva. Este proceso puede tardar. Se te notificará al finalizar.");

    const payload = {
        accion: 'guardar_semestre',
        fecha_base: selectedDate,
        semestre: semestreNumero
    };
    
    // Esta llamada requiere que 'manejar_asignaciones.php' entienda la nueva lógica de semestre
    const exito = await manejarAsignacionAPI(payload);

    if (exito) {
        alert("¡Éxito! Todas las asignaciones se han copiado al semestre completo.");
        cargarDatos(selectedDate);
    } else {
        alert("Ocurrió un error durante la asignación masiva. Revisa la consola.");
    }
};


// === LÓGICA PARA MODAL DE SEMESTRES (CONECTADO A LA API) ===

function abrirModalSemestre() {
    document.getElementById('semestre1_inicio').value = configSemestre.semestre1_inicio || '';
    document.getElementById('semestre1_fin').value = configSemestre.semestre1_fin || '';
    document.getElementById('semestre2_inicio').value = configSemestre.semestre2_inicio || '';
    document.getElementById('semestre2_fin').value = configSemestre.semestre2_fin || '';
    modalSemestre.style.display = 'flex';
}

function cerrarModalSemestre() {
    modalSemestre.style.display = 'none';
}

async function guardarFechasSemestre() {
    const payload = {
        inicioS1: document.getElementById('semestre1_inicio').value,
        finS1: document.getElementById('semestre1_fin').value,
        inicioS2: document.getElementById('semestre2_inicio').value,
        finS2: document.getElementById('semestre2_fin').value,
    };

    if (!payload.inicioS1 || !payload.finS1 || !payload.inicioS2 || !payload.finS2) {
        alert("Por favor, complete todas las fechas.");
        return;
    }
    
    try {
        const response = await fetch('../api/manejar_configuracion.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.error) throw new Error(result.mensaje);

        alert(result.mensaje);
        // Actualizar la configuración localmente tras guardar
        configSemestre = {
            semestre1_inicio: payload.inicioS1, semestre1_fin: payload.finS1,
            semestre2_inicio: payload.inicioS2, semestre2_fin: payload.finS2
        };
        cerrarModalSemestre();

    } catch (error) {
        console.error("Error al guardar fechas:", error);
        alert("Error al guardar las fechas: " + error.message);
    }
}

// === EVENT LISTENERS y FUNCIONES AUXILIARES ===

document.addEventListener('DOMContentLoaded', () => {
    // Inicia la aplicación con la fecha de hoy
    actualizarVistaPorFecha(toYYYYMMDD(new Date()));
});

fechaInput.addEventListener("change", () => {
    actualizarVistaPorFecha(fechaInput.value);
});

configSemestreBtn.addEventListener('click', abrirModalSemestre);
cerrarModalSemestreBtn.addEventListener('click', cerrarModalSemestre);
guardarFechasSemestreBtn.addEventListener('click', guardarFechasSemestre);

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
asignarProfesorBtn.onclick = () => { if (celdasSeleccionadas.length > 0) abrirModal(); };
window.onclick = e => { 
    if (e.target === modal) cerrarModal(); 
    if (e.target === modalSemestre) cerrarModalSemestre();
};