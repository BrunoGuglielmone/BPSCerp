document.addEventListener('DOMContentLoaded', () => {
    // === ESTADO DE LA APLICACIÓN ===
    let horarios = [], salones = [], asignaturas = [], configSemestre = {};
    let asignacionesDelDia = {};
    let selectedDate;
    let celdasSeleccionadas = [];

    // === ELEMENTOS DOM ===
    const tabla = document.getElementById("tablaHorarios");
    const tbody = tabla.querySelector("tbody");
    const fechaInput = document.getElementById("fechaInput");
    const semanaBotonesContainer = document.getElementById("semana-botones");
    
    // Modales de la página
    const modalAsignacion = document.getElementById("modal-asignacion");
    const cerrarModalBtn = document.getElementById("cerrarModal");
    const infoCeldaEl = document.getElementById("info-celda");
    const asignaturaSelect = document.getElementById("modal-asignatura-select");
    const docenteSelect = document.getElementById("modal-docente-select");
    const confirmarAsignacionBtn = document.getElementById("confirmarAsignacionBtn");

    const modalSemestre = document.getElementById("modalSemestre");
    const cerrarModalSemestreBtn = document.getElementById("cerrarModalSemestre");
    const guardarFechasSemestreBtn = document.getElementById("guardarFechasSemestreBtn");
    const configSemestreBtn = document.getElementById("configSemestreBtn");

    // Modal de Notificación Genérico
    const modalNotificacion = document.getElementById('modal-notificacion');
    const notificacionTitulo = document.getElementById('notificacion-titulo');
    const notificacionMensaje = document.getElementById('notificacion-mensaje');
    const notificacionBtnAceptar = document.getElementById('notificacion-btn-aceptar');
    const notificacionBtnCancelar = document.getElementById('notificacion-btn-cancelar');

    // Botones de acción
    const asignarACeldaBtn = document.getElementById("asignarACeldaBtn");
    const asignarSemestreBtn = document.getElementById("asignarSemestreBtn");
    
    // === APIs ===
    const API_GET_DATOS = '../api/get_datos.php';
    const API_ASIGNACIONES = '../api/manejar_asignaciones.php';
    const API_ACADEMICO = '../api/gestionar_academico.php';
    const API_CONFIG = '../api/manejar_configuracion.php';

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

    // === LÓGICA DE INICIALIZACIÓN Y CARGA DE DATOS ===
    async function init() {
        try {
            configSemestre = await fetchJSON(API_CONFIG) || {};
            const hoy = new Date();
            if (hoy.getDay() === 0) hoy.setDate(hoy.getDate() + 1);
            actualizarVistaPorFecha(toYYYYMMDD(hoy));
        } catch (error) {
            console.error("No se pudo inicializar el salonario.");
        }
    }

    async function cargarDatosDelDia(fecha) {
        try {
            const data = await fetchJSON(`${API_GET_DATOS}?fecha=${fecha}`);
            salones = data.salones || [];
            horarios = data.horarios || [];
            asignaturas = data.asignaturas || [];
            asignacionesDelDia = data.asignaciones || {};
            renderTabla();
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="${(horarios.length || 1) + 1}">No se pudieron cargar los datos del día.</td></tr>`;
        }
    }

    // === RENDERIZADO Y MANEJO DE LA TABLA ===
    function renderTabla() {
        const thead = tabla.querySelector("thead tr");
        thead.innerHTML = "<th>Salón</th>" + horarios.map(h => `<th>${h.hora}</th>`).join("");
        tbody.innerHTML = "";
    
        salones.forEach(salon => {
            const fila = document.createElement("tr");
            fila.dataset.salonId = salon.id;
            const celdasHorario = horarios.map(hora => {
                const key = `${salon.id}-${hora.id}`;
                const asignacion = asignacionesDelDia[key];
                if (asignacion) {
                    const anoHtml = asignacion.ano_cursado ? `<div class="ano-cursado">${asignacion.ano_cursado}º Año</div>` : '';
                    return `<td class="ocupado" data-salon-id="${salon.id}" data-horario-id="${hora.id}">
                                <span class="btn-quitar" title="Quitar asignación">×</span>
                                <div class="asignatura-nombre">${asignacion.asignatura_nombre}</div>
                                <div class="docente-nombre">${asignacion.docente_nombre}</div>
                                ${anoHtml}
                            </td>`;
                } else {
                    return `<td class="libre" data-salon-id="${salon.id}" data-horario-id="${hora.id}"><span class="plus">+</span></td>`;
                }
            }).join("");
            fila.innerHTML = `<td>${salon.nombre}</td>${celdasHorario}`;
            tbody.appendChild(fila);
        });
        attachEventosCeldas();
    }

    function attachEventosCeldas() {
        tbody.querySelectorAll("td[data-salon-id]").forEach(td => {
            if (td.classList.contains('libre')) {
                td.onclick = () => manejarSeleccionCelda(td);
            } else {
                td.querySelector('.btn-quitar')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    quitarAsignacion(td);
                });
            }
        });
    }

    function manejarSeleccionCelda(td) {
        td.classList.toggle("seleccionado");
        const key = `${td.dataset.salonId}-${td.dataset.horarioId}`;
        const index = celdasSeleccionadas.indexOf(key);
        if (index > -1) celdasSeleccionadas.splice(index, 1);
        else celdasSeleccionadas.push(key);
        asignarACeldaBtn.disabled = celdasSeleccionadas.length === 0;
    }

    // === LÓGICA DE MODALES ===
    function abrirModal(modal) { modal.classList.add('visible'); }
    function cerrarModalElem(modal) { modal.classList.remove('visible'); }

    function abrirModalAsignacion() {
        if (celdasSeleccionadas.length === 0) return;
        const [salonId, horarioId] = celdasSeleccionadas[0].split('-');
        const salonNombre = salones.find(s => s.id == salonId)?.nombre || 'Desconocido';
        const horarioNombre = horarios.find(h => h.id == horarioId)?.hora || 'Desconocido';
        infoCeldaEl.textContent = `${salonNombre} - ${horarioNombre}` + (celdasSeleccionadas.length > 1 ? ` (+${celdasSeleccionadas.length - 1} más)` : '');
        asignaturaSelect.innerHTML = '<option value="">-- Elija una asignatura --</option>' + asignaturas.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('');
        docenteSelect.innerHTML = '<option value="">-- Esperando asignatura --</option>';
        docenteSelect.disabled = true;
        confirmarAsignacionBtn.disabled = true;
        abrirModal(modalAsignacion);
    }

    async function cargarDocentesParaAsignatura(asignaturaId) {
        docenteSelect.innerHTML = '<option value="">Cargando...</option>';
        docenteSelect.disabled = true;
        confirmarAsignacionBtn.disabled = true;
        if (!asignaturaId) {
            docenteSelect.innerHTML = '<option value="">-- Esperando asignatura --</option>';
            return;
        }
        try {
            const docentes = await fetchJSON(`${API_ACADEMICO}?accion=listar_docentes_por_asignatura&asignatura_id=${asignaturaId}`);
            docenteSelect.innerHTML = '<option value="">-- Seleccione un docente --</option>';
            if (docentes.length > 0) {
                docenteSelect.innerHTML += docentes.map(d => `<option value="${d.id}">${d.nombre_completo}</option>`).join('');
                docenteSelect.disabled = false;
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

    function actualizarVistaPorFecha(fechaStr) {
        if (!fechaStr || fechaStr === selectedDate) return;
        selectedDate = fechaStr;
        fechaInput.value = selectedDate;
        actualizarBotonesSemana(new Date(fechaStr + 'T12:00:00'));
        cargarDatosDelDia(selectedDate);
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
    
    init();
});