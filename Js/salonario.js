// === ESTADO DE LA APLICACIÓN ===
let horarios = [];
let salones = [];
let profesores = [];
let asignaciones = {};
let selectedDate;
let celdasSeleccionadas = [];
let salonSeleccionado = null;
let currentYear = new Date().getFullYear();

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
const semestreToggle = document.getElementById("semestreToggleInput");
const asignarSemestreBtn = document.getElementById("asignarSemestreBtn");

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

    // === FUNCIÓN PARA MODALES ===
    const mostrarNotificacion = (titulo, mensaje, tipo = 'alerta') => {
        notificacionTitulo.textContent = titulo;
        notificacionMensaje.innerHTML = mensaje;
        modalNotificacion.classList.add('visible');
        
        return new Promise(resolve => {
            if (tipo === 'confirmacion') {
                notificacionBtnCancelar.style.display = 'inline-flex';
                notificacionBtnAceptar.textContent = 'Confirmar';
                notificacionBtnAceptar.onclick = () => { modalNotificacion.classList.remove('visible'); resolve(true); };
                notificacionBtnCancelar.onclick = () => { modalNotificacion.classList.remove('visible'); resolve(false); };
            } else {
                notificacionBtnCancelar.style.display = 'none';
                notificacionBtnAceptar.textContent = 'Aceptar';
                notificacionBtnAceptar.onclick = () => { modalNotificacion.classList.remove('visible'); resolve(true); };
            }
        });
    }
    
    // === FUNCIONES DE API ===
    async function fetchJSON(url, options = {}) {
        try {
            const response = await fetch(url, options);
            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || `Error de red: ${response.status}`);
            }
            return responseData;
        } catch (error) {
            console.error('Error en la llamada a la API:', error);
            await mostrarNotificacion('Error de Conexión', error.message);
            throw error;
        }
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
                docenteSelect.innerHTML = '<option value="">No hay docentes habilitados</option>';
            }
        } catch (error) {
            docenteSelect.innerHTML = '<option value="">Error al cargar</option>';
        }
    }

    function cerrarModalAsignacion() {
        cerrarModalElem(modalAsignacion);
        celdasSeleccionadas.forEach(key => {
            const [salonId, horarioId] = key.split('-');
            tbody.querySelector(`[data-salon-id="${salonId}"][data-horario-id="${horarioId}"]`)?.classList.remove('seleccionado');
        });
        celdasSeleccionadas = [];
        asignarACeldaBtn.disabled = true;
    }

    function abrirModalSemestre() {
        document.getElementById('semestre1_inicio').value = configSemestre.semestre1_inicio || '';
        document.getElementById('semestre1_fin').value = configSemestre.semestre1_fin || '';
        document.getElementById('semestre2_inicio').value = configSemestre.semestre2_inicio || '';
        document.getElementById('semestre2_fin').value = configSemestre.semestre2_fin || '';
        abrirModal(modalSemestre);
    }
    
    async function guardarFechasSemestre() {
        const payload = {
            inicioS1: document.getElementById('semestre1_inicio').value,
            finS1: document.getElementById('semestre1_fin').value,
            inicioS2: document.getElementById('semestre2_inicio').value,
            finS2: document.getElementById('semestre2_fin').value,
        };
        if (!payload.inicioS1 || !payload.finS1 || !payload.inicioS2 || !payload.finS2) {
            await mostrarNotificacion("Datos Incompletos", "Por favor, complete todas las fechas.");
            return;
        }
        try {
            const result = await fetchJSON(API_CONFIG, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            await mostrarNotificacion("Éxito", result.mensaje);
            configSemestre = { semestre1_inicio: payload.inicioS1, semestre1_fin: payload.finS1, semestre2_inicio: payload.inicioS2, semestre2_fin: payload.finS2 };
            cerrarModalElem(modalSemestre);
        } catch (error) {}
    }

    // === LÓGICA DE ACCIONES ===
    async function confirmarAsignacion() {
        const asignaturaId = asignaturaSelect.value;
        const docenteId = docenteSelect.value;
        if (!asignaturaId || !docenteId) {
            await mostrarNotificacion("Datos Incompletos", "Por favor, seleccione una asignatura y un docente.");
            return;
        }
        confirmarAsignacionBtn.disabled = true;
        confirmarAsignacionBtn.textContent = "Guardando...";
        try {
            for (const key of celdasSeleccionadas) {
                const [salon_id, horario_id] = key.split('-');
                const payload = { accion: 'guardar', fecha: selectedDate, salon_id, horario_id, docente_id: docenteId, asignatura_id: asignaturaId };
                await fetchJSON(API_ASIGNACIONES, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                });
            }
        } catch(error) {
            await mostrarNotificacion("Error", "Una o más asignaciones no se pudieron guardar.");
        }
        confirmarAsignacionBtn.disabled = false;
        confirmarAsignacionBtn.textContent = "Confirmar Asignación";
        cerrarModalAsignacion();
        await cargarDatosDelDia(selectedDate);
    }

    async function quitarAsignacion(td) {
        const confirmado = await mostrarNotificacion('Confirmar Acción', '¿Está seguro de que desea quitar esta asignación?', 'confirmacion');
        if (!confirmado) return;
        const payload = { accion: 'quitar', fecha: selectedDate, salon_id: td.dataset.salonId, horario_id: td.dataset.horarioId };
        try {
            await fetchJSON(API_ASIGNACIONES, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            await cargarDatosDelDia(selectedDate);
        } catch (error) {}
    }
    
    async function asignarHorarioASemestre() {
        if (!selectedDate || Object.keys(asignacionesDelDia).length === 0) {
            await mostrarNotificacion("Acción no válida", "No hay ninguna asignación en el día actual para replicar.");
            return;
        }
        let semestreNumero = 0;
        if (configSemestre.semestre1_inicio && selectedDate >= configSemestre.semestre1_inicio && selectedDate <= configSemestre.semestre1_fin) semestreNumero = 1;
        else if (configSemestre.semestre2_inicio && selectedDate >= configSemestre.semestre2_inicio && selectedDate <= configSemestre.semestre2_fin) semestreNumero = 2;
        if (semestreNumero === 0) {
            await mostrarNotificacion("Sin Semestre Configurado", "La fecha actual no pertenece a ningún semestre. Vaya a 'Configurar Semestres' para definirlos.");
            return;
        }
        const semestreTexto = semestreNumero === 1 ? "primer" : "segundo";
        const diaSemana = new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long' });
        const confirmado = await mostrarNotificacion('Confirmar Asignación Masiva', `Se replicará el horario de hoy (${diaSemana}) a <b>todos los ${diaSemana}</b> del ${semestreTexto} semestre.<br><br>Esta acción sobreescribirá cualquier horario existente en esos días. ¿Desea continuar?`, 'confirmacion');
        if (!confirmado) return;
        
        await mostrarNotificacion("Proceso Iniciado", "Iniciando asignación masiva. Este proceso puede tardar. Se te notificará al finalizar.");
        
        const payload = { accion: 'guardar_semestre', fecha_base: selectedDate, semestre: semestreNumero, config: configSemestre };
        try {
            const result = await fetchJSON(API_ASIGNACIONES, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            await mostrarNotificacion("Proceso Finalizado", result.message);
        } catch (error) {}
    }
    
    // === LÓGICA DE FECHAS Y SEMANA ===
    function toYYYYMMDD(date) { return date.toISOString().split('T')[0]; }

// === NUEVA LÓGICA PARA SEMESTRES Y RESTRICCIONES DE FECHA ===

function actualizarRestriccionesYFecha() {
    const esSegundoSemestre = semestreToggle.checked;
    
    const primerSemestreMax = `${currentYear}-07-27`;
    const segundoSemestreMin = `${currentYear}-07-28`;

    if (esSegundoSemestre) {
        fechaInput.min = segundoSemestreMin;
        fechaInput.max = ''; 
        if (fechaInput.value < segundoSemestreMin) {
            fechaInput.value = segundoSemestreMin;
        }
    } else { // Primer semestre
        fechaInput.min = '';
        fechaInput.max = primerSemestreMax;
        if (fechaInput.value > primerSemestreMax) {
            fechaInput.value = primerSemestreMax;
        }
    }
    // evento de cambio para recargar la tabla con la fecha potencialmente ajustada
    fechaInput.dispatchEvent(new Event('change'));
}

// === FUNCIÓN PARA ASIGNAR A TODO EL SEMESTRE ===
asignarSemestreBtn.onclick = async () => {
    const asignacionesDelDia = asignaciones[selectedDate];
    if (!asignacionesDelDia || Object.keys(asignacionesDelDia).length === 0) {
        return alert("No hay ninguna asignación en la fecha seleccionada para copiar.");
    }

    const esSegundoSemestre = semestreToggle.checked;
    const semestreTexto = esSegundoSemestre ? "segundo" : "primer";
    const diaSemana = new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long' });

    const confirmacion = confirm(
        `Esto copiará TODAS las asignaciones del día ${selectedDate} (${diaSemana}) a todos los ${diaSemana}s correspondientes del ${semestreTexto} semestre.\n\n¿Estás seguro de que deseas continuar? Esta acción es irreversible.`
    );

    if (!confirmacion) return;
    
    alert("Iniciando asignación masiva. Este proceso puede tardar un momento. Se te notificará al finalizar.");

    const payload = {
        accion: 'guardar_semestre',
        fecha_base: selectedDate,
        semestre: esSegundoSemestre ? 2 : 1
    };

    const exito = await manejarAsignacionAPI(payload);

    if (exito) {
        alert("¡Éxito! Todas las asignaciones se han copiado al semestre completo.");
        cargarDatos(selectedDate);
    } else {
        alert("Ocurrió un error durante la asignación masiva. Revisa la consola para más detalles.");
    }
};

// === EVENT LISTENERS y FUNCIONES AUXILIARES ===
document.addEventListener('DOMContentLoaded', () => {
    const hoy = new Date();
    // La fecha de corte es el 28 de Julio (mes 6 en JS)
    semestreToggle.checked = hoy >= new Date(currentYear, 6, 28);

    selectedDate = toYYYYMMDD(hoy);
    fechaInput.value = selectedDate;

    // 1. Aplicamos las restricciones de fecha (min/max) al cargar.
    const esSegundoSemestre = semestreToggle.checked;
    if (esSegundoSemestre) {
        fechaInput.min = `${currentYear}-07-28`;
        fechaInput.max = '';
    } else {
        fechaInput.min = '';
        fechaInput.max = `${currentYear}-07-27`;
    }

    // 2. Cargamos los datos para la fecha de hoy.
    cargarDatos(selectedDate);
});

fechaInput.addEventListener("change", () => {
    selectedDate = fechaInput.value;
    cargarDatos(selectedDate);
});

// Listener para el nuevo interruptor de semestre
semestreToggle.addEventListener('change', actualizarRestriccionesYFecha);


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

    function actualizarBotonesSemana(fechaDeReferencia) {
        const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const diaDeRefNum = fechaDeReferencia.getDay();
        const offset = (diaDeRefNum === 0 ? 6 : diaDeRefNum - 1);
        const lunesDeLaSemana = new Date(fechaDeReferencia);
        lunesDeLaSemana.setDate(fechaDeReferencia.getDate() - offset);
        semanaBotonesContainer.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const fechaDia = new Date(lunesDeLaSemana);
            fechaDia.setDate(lunesDeLaSemana.getDate() + i);
            const fechaFormato = toYYYYMMDD(fechaDia);
            const boton = document.createElement('button');
            boton.innerText = dias[i];
            if (fechaFormato === selectedDate) boton.classList.add('activo');
            boton.addEventListener('click', () => actualizarVistaPorFecha(fechaFormato));
            semanaBotonesContainer.appendChild(boton);
        }
    }
    
    // === EVENT LISTENERS ===
    asignaturaSelect.addEventListener('change', () => cargarDocentesParaAsignatura(asignaturaSelect.value));
    docenteSelect.addEventListener('change', () => confirmarAsignacionBtn.disabled = !docenteSelect.value);
    confirmarAsignacionBtn.addEventListener('click', confirmarAsignacion);
    cerrarModalBtn.addEventListener('click', cerrarModalAsignacion);
    fechaInput.addEventListener("change", () => actualizarVistaPorFecha(fechaInput.value));
    asignarACeldaBtn.addEventListener('click', abrirModalAsignacion);
    asignarSemestreBtn.addEventListener('click', asignarHorarioASemestre);
    configSemestreBtn.addEventListener('click', abrirModalSemestre);
    cerrarModalSemestreBtn.addEventListener('click', () => cerrarModalElem(modalSemestre));
    guardarFechasSemestreBtn.addEventListener('click', guardarFechasSemestre);
    
    window.addEventListener('click', e => {
        if (e.target.classList.contains('modal-overlay')) {
             e.target.classList.remove('visible');
             if (e.target.id === 'modal-asignacion') cerrarModalAsignacion();
        }
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
