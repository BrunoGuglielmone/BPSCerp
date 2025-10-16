document.addEventListener('DOMContentLoaded', () => {
    // === ESTADO DE LA APLICACIÓN ===
    let todasLasCarreras = [], todasLasAsignaturas = [], todosLosDocentes = [];
    let carreraActivaId = null;
    let planDeEstudioActivo = {};

    // === APIs ===
    const API_ACADEMICO = '../api/gestionar_academico.php';
    const API_ASIGNATURAS = '../api/gestionar_asignaturas.php';
    const API_DOCENTES = '../api/gestionar_docentes.php';

    // === SELECTORES DEL DOM ===
    const listaCarrerasEl = document.getElementById('lista-carreras');
    const btnCrearCarrera = document.getElementById('btn-crear-carrera');
    const placeholderEl = document.getElementById('plan-estudio-placeholder');
    const detalleEl = document.getElementById('plan-estudio-detalle');
    const planTituloEl = document.getElementById('plan-estudio-titulo');
    const anosContainerEl = document.getElementById('anos-container');
    
    // Selectores de Modales de Formulario
    const modalCarrera = document.getElementById('modal-carrera');
    const formCarrera = document.getElementById('form-carrera');
    const modalCarreraTitulo = document.getElementById('modal-carrera-titulo');
    const cerrarModalCarreraBtn = document.getElementById('cerrar-modal-carrera');
    const modalAgregarAsignatura = document.getElementById('modal-agregar-asignatura');
    const formAgregarAsignatura = document.getElementById('form-agregar-asignatura');
    const cerrarModalAgregarAsignaturaBtn = document.getElementById('cerrar-modal-agregar-asignatura');
    const modalAsignarDocente = document.getElementById('modal-asignar-docente');
    const formAsignarDocente = document.getElementById('form-asignar-docente');
    const modalAsignarDocenteTitulo = document.getElementById('modal-asignar-docente-titulo');
    const cerrarModalAsignarDocenteBtn = document.getElementById('cerrar-modal-asignar-docente');
    const listaDocentesCheckboxesEl = document.getElementById('lista-docentes-checkboxes');
    const buscadorDocenteInput = document.getElementById('buscador-docente');
    const buscadorAsignaturaInput = document.getElementById('buscador-asignatura');
    const listaAsignaturasResultadosEl = document.getElementById('lista-asignaturas-resultados');

    // Selectores para Modales de Notificación
    const modalNotificacion = document.getElementById('modal-notificacion');
    const notificacionTitulo = document.getElementById('notificacion-titulo');
    const notificacionMensaje = document.getElementById('notificacion-mensaje');
    const notificacionBtnAceptar = document.getElementById('notificacion-btn-aceptar');
    const notificacionBtnCancelar = document.getElementById('notificacion-btn-cancelar');

    // === FUNCIONES PARA MODALES PERSONALIZADOS ===
    function mostrarNotificacion(titulo, mensaje, tipo = 'alerta') {
        notificacionTitulo.textContent = titulo;
        notificacionMensaje.innerHTML = mensaje;
        modalNotificacion.classList.add('visible');
        
        return new Promise(resolve => {
            if (tipo === 'confirmacion') {
                notificacionBtnCancelar.style.display = 'inline-flex';
                notificacionBtnAceptar.textContent = 'Confirmar';
                
                notificacionBtnAceptar.onclick = () => {
                    modalNotificacion.classList.remove('visible');
                    resolve(true);
                };
                notificacionBtnCancelar.onclick = () => {
                    modalNotificacion.classList.remove('visible');
                    resolve(false);
                };
            } else {
                notificacionBtnCancelar.style.display = 'none';
                notificacionBtnAceptar.textContent = 'Aceptar';
                notificacionBtnAceptar.onclick = () => {
                    modalNotificacion.classList.remove('visible');
                    resolve(true);
                };
            }
        });
    }

    // === INICIALIZACIÓN ===
    async function init() {
        try {
            const [carrerasRes, asignaturasRes, docentesRes] = await Promise.all([
                fetch(`${API_ACADEMICO}?accion=listar_carreras`),
                fetch(API_ASIGNATURAS),
                fetch(API_DOCENTES)
            ]);
            if (!carrerasRes.ok || !asignaturasRes.ok || !docentesRes.ok) throw new Error("Fallo en la carga de datos iniciales.");
            todasLasCarreras = await carrerasRes.json();
            todasLasAsignaturas = await asignaturasRes.json();
            todosLosDocentes = await docentesRes.json();
            renderizarListaCarreras();
        } catch (error) {
            console.error("Error al inicializar:", error);
            await mostrarNotificacion("Error Crítico", "No se pudieron cargar los datos iniciales. Por favor, recarga la página o contacta a soporte.");
        }
    }

    // === RENDERIZADO ===
    function renderizarListaCarreras() {
        listaCarrerasEl.innerHTML = '';
        todasLasCarreras.forEach(carrera => {
            const li = document.createElement('li');
            li.dataset.id = carrera.id;
            li.className = carrera.id == carreraActivaId ? 'activa' : '';
            li.style.setProperty('--carrera-color', carrera.color);
            
            // MODIFICADO: Se añade la etiqueta para el turno
            const turnoTag = carrera.turno ? `<span class="tag-turno ${carrera.turno.toLowerCase()}">${carrera.turno}</span>` : '';
            li.innerHTML = `<span>${carrera.nombre}</span>${turnoTag}`;
            
            li.addEventListener('click', () => {
                if (carreraActivaId !== carrera.id) {
                    carreraActivaId = carrera.id;
                    renderizarListaCarreras();
                    cargarPlanDeEstudio(carrera);
                }
            });
            listaCarrerasEl.appendChild(li);
        });
    }

    async function cargarPlanDeEstudio(carrera) {
        const { id, nombre } = carrera;
        placeholderEl.style.display = 'none';
        detalleEl.style.display = 'block';
        planTituloEl.innerHTML = `${nombre} 
            <button id="btn-editar-carrera-activa" class="btn-icon" title="Editar Orientación">
                <i class="fa fa-cog"></i>
            </button>`;
        
        document.getElementById('btn-editar-carrera-activa').addEventListener('click', () => abrirModalCarrera(carrera));
        
        anosContainerEl.innerHTML = '<div class="loader"></div>';

        try {
            const response = await fetch(`${API_ACADEMICO}?accion=obtener_plan_estudio&carrera_id=${id}`);
            if (!response.ok) throw new Error("No se pudo cargar el plan de estudios.");
            planDeEstudioActivo = await response.json();
            
            anosContainerEl.innerHTML = '';
            const duracion = carrera.ano || 4;

            for (let i = 1; i <= duracion; i++) {
                const anoCard = document.createElement('div');
                anoCard.className = 'ano-card';
                const asignaturasDelAno = planDeEstudioActivo[i] || [];
                const asignaturasHtml = asignaturasDelAno.length > 0 ? asignaturasDelAno.map(asig => `
                    <li class="asignatura-item" data-asig-id="${asig.asignatura_id}">
                        <div class="asignatura-info">
                            <strong>${asig.asignatura_nombre}</strong>
                            <button class="btn-quitar-asignatura" title="Quitar del plan"><i class="fa fa-times"></i></button>
                        </div>
                        <div class="docentes-asignados">
                            ${asig.docentes.length > 0 ? asig.docentes.map(d => `<span class="tag">${d.nombre}</span>`).join('') : '<em>Sin docentes asignados.</em>'}
                        </div>
                        <button class="btn btn-secondary btn-sm btn-asignar-docente" data-asig-nombre="${asig.asignatura_nombre}">
                            <i class="fa fa-chalkboard-teacher"></i> Asignar Docente
                        </button>
                    </li>`).join('') : '<p class="no-asignaturas">No hay asignaturas en este año.</p>';

                anoCard.innerHTML = `
                    <div class="ano-header">
                        <h3>${i}º Año</h3>
                        <div class="ano-actions">
                             <button class="btn-icon btn-agregar-asignatura" data-ano="${i}" title="Agregar Asignatura">
                                <i class="fa fa-plus-circle"></i>
                            </button>
                            <button class="btn-icon btn-limpiar-ano" data-ano="${i}" title="Limpiar todas las asignaturas">
                                <i class="fa fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                    <ul class="asignaturas-lista">${asignaturasHtml}</ul>`;
                anosContainerEl.appendChild(anoCard);
            }
            
            anosContainerEl.querySelectorAll('.btn-agregar-asignatura').forEach(btn => btn.addEventListener('click', () => abrirModalAgregarAsignatura(btn.dataset.ano)));
            anosContainerEl.querySelectorAll('.btn-limpiar-ano').forEach(btn => btn.addEventListener('click', () => limpiarAno(btn.dataset.ano)));
            anosContainerEl.querySelectorAll('.btn-quitar-asignatura').forEach(btn => btn.addEventListener('click', () => quitarAsignaturaDePlan(btn.closest('.asignatura-item').dataset.asigId)));
            anosContainerEl.querySelectorAll('.btn-asignar-docente').forEach(btn => btn.addEventListener('click', () => abrirModalAsignarDocente(btn.closest('.asignatura-item').dataset.asigId, btn.dataset.asigNombre)));

        } catch (error) {
            await mostrarNotificacion("Error", error.message);
            anosContainerEl.innerHTML = '<p>Error al cargar el plan.</p>';
        }
    }

    // === LÓGICA DE ACCIONES ===
    async function peticionAPI(data) {
        try {
            const response = await fetch(API_ACADEMICO, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            await mostrarNotificacion(result.success ? 'Éxito' : 'Error', result.message);
            return result.success;
        } catch (error) {
            await mostrarNotificacion('Error de Conexión', error.message || 'No se pudo comunicar con el servidor.');
            return false;
        }
    }
    
    async function guardarCarrera(e) {
        e.preventDefault();
        const formData = new FormData(formCarrera);
        const idOriginal = formData.get('carrera_id');
        const success = await peticionAPI({
            accion: 'guardar_carrera',
            carrera_id: idOriginal,
            nombre: formData.get('nombre'),
            color: formData.get('color'),
            ano: formData.get('ano'),
            turno: formData.get('turno') // <-- MODIFICADO: Se envía el turno a la API
        });
        if (success) {
            cerrarModal(modalCarrera);
            const idActivoAnterior = carreraActivaId;
            await init();
            const nuevaCarreraActiva = todasLasCarreras.find(c => c.id == idActivoAnterior) || todasLasCarreras[todasLasCarreras.length-1];
            if(nuevaCarreraActiva) {
                carreraActivaId = nuevaCarreraActiva.id;
                renderizarListaCarreras();
                cargarPlanDeEstudio(nuevaCarreraActiva);
            }
        }
    }

    async function limpiarAno(ano) {
        const confirmado = await mostrarNotificacion('Confirmar Acción', `¿Seguro que quieres eliminar TODAS las asignaturas de ${ano}º Año de este plan? Esta acción no se puede deshacer.`, 'confirmacion');
        if (!confirmado) return;
        const success = await peticionAPI({ accion: 'limpiar_ano', carrera_id: carreraActivaId, ano_cursado: ano });
        if (success) {
            const carrera = todasLasCarreras.find(c => c.id == carreraActivaId);
            cargarPlanDeEstudio(carrera);
        }
    }

    async function agregarAsignaturaAPlan(e) {
        e.preventDefault();
        const formData = new FormData(formAgregarAsignatura);
        const success = await peticionAPI({
            accion: 'agregar_asignatura_a_plan',
            carrera_id: formData.get('carrera_id'), asignatura_id: formData.get('asignatura_id'),
            ano_cursado: formData.get('ano_cursado')
        });
        if (success) {
            cerrarModal(modalAgregarAsignatura);
            const carrera = todasLasCarreras.find(c => c.id == carreraActivaId);
            cargarPlanDeEstudio(carrera);
        }
    }
    
    async function quitarAsignaturaDePlan(asignaturaId) {
        const confirmado = await mostrarNotificacion('Confirmar Acción', '¿Quitar esta asignatura del plan de estudios?', 'confirmacion');
        if (!confirmado) return;
        const success = await peticionAPI({ accion: 'quitar_asignatura_de_plan', carrera_id: carreraActivaId, asignatura_id: asignaturaId });
        if (success) {
            const carrera = todasLasCarreras.find(c => c.id == carreraActivaId);
            cargarPlanDeEstudio(carrera);
        }
    }

    async function actualizarDocentesAsignatura(e) {
        e.preventDefault();
        const formData = new FormData(formAsignarDocente);
        const asignaturaId = formData.get('asignatura_id');
        const docenteIds = Array.from(formAsignarDocente.querySelectorAll('input[name="docentes"]:checked')).map(cb => cb.value);
        const success = await peticionAPI({ accion: 'actualizar_docentes_asignatura', asignatura_id: asignaturaId, docente_ids: docenteIds });
        if (success) {
            cerrarModal(modalAsignarDocente);
            const carrera = todasLasCarreras.find(c => c.id == carreraActivaId);
            cargarPlanDeEstudio(carrera);
        }
    }

    // === MANEJO DE MODALES ===
    function abrirModal(modal) { modal.classList.add('visible'); }
    function cerrarModal(modal) { modal.classList.remove('visible'); }

    function abrirModalCarrera(carrera = null) {
        formCarrera.reset();
        if (carrera) {
            modalCarreraTitulo.textContent = 'Editar Orientación';
            formCarrera.carrera_id.value = carrera.id;
            formCarrera.nombre.value = carrera.nombre;
            formCarrera.color.value = carrera.color;
            formCarrera.ano.value = carrera.ano;
            // MODIFICADO: Se asigna el valor del turno al editar
            formCarrera.turno.value = carrera.turno || 'Matutino';
        } else {
            modalCarreraTitulo.textContent = 'Nueva Orientación';
            formCarrera.carrera_id.value = '';
        }
        abrirModal(modalCarrera);
    }
    
    function abrirModalAgregarAsignatura(ano) {
        formAgregarAsignatura.reset();
        formAgregarAsignatura.carrera_id.value = carreraActivaId;
        formAgregarAsignatura.ano_cursado.value = ano;
        
        const btnSubmit = formAgregarAsignatura.querySelector('button[type="submit"]');
        const infoSeleccion = document.getElementById('asignatura-seleccionada-info');
        
        btnSubmit.disabled = true;
        infoSeleccion.style.display = 'none';
        listaAsignaturasResultadosEl.innerHTML = '<p class="empty-state">Comienza a escribir para ver asignaturas.</p>';
        buscadorAsignaturaInput.value = '';
        
        document.getElementById('modal-agregar-asignatura-titulo').textContent = `Agregar Asignatura a ${ano}º Año`;
        abrirModal(modalAgregarAsignatura);
    }
    
    function abrirModalAsignarDocente(asignaturaId, asignaturaNombre) {
        formAsignarDocente.reset();
        formAsignarDocente.asignatura_id.value = asignaturaId;
        modalAsignarDocenteTitulo.textContent = `Asignar Docentes a: ${asignaturaNombre}`;
        
        let docentesAsignadosIds = [];
        for (const ano in planDeEstudioActivo) {
            const asig = planDeEstudioActivo[ano].find(a => a.asignatura_id == asignaturaId);
            if (asig) {
                docentesAsignadosIds = asig.docentes.map(d => d.id);
                break;
            }
        }

        listaDocentesCheckboxesEl.innerHTML = '';
        if (todosLosDocentes.length > 0) {
            todosLosDocentes.forEach(doc => {
                const isChecked = docentesAsignadosIds.includes(String(doc.id));
                const label = document.createElement('label');
                label.innerHTML = `<input type="checkbox" name="docentes" value="${doc.id}" ${isChecked ? 'checked' : ''}> ${doc.apellido}, ${doc.nombre}`;
                listaDocentesCheckboxesEl.appendChild(label);
            });
        } else {
            listaDocentesCheckboxesEl.innerHTML = '<p class="empty-state">No hay docentes registrados.</p>';
        }
        
        buscadorDocenteInput.value = '';
        filtrarListaDocentes(); 
        abrirModal(modalAsignarDocente);
    }

    // === LÓGICA DE BÚSQUEDA Y FILTROS ===
    function filtrarListaDocentes() {
        const filtro = buscadorDocenteInput.value.toLowerCase().trim();
        const labels = listaDocentesCheckboxesEl.querySelectorAll('label');
        let count = 0;
        labels.forEach(label => {
            const texto = label.textContent.toLowerCase();
            if (texto.includes(filtro)) {
                label.style.display = 'flex';
                count++;
            } else {
                label.style.display = 'none';
            }
        });
        const emptyMsg = listaDocentesCheckboxesEl.querySelector('.filter-empty');
        if (emptyMsg) emptyMsg.remove();
        if (count === 0 && todosLosDocentes.length > 0) {
             listaDocentesCheckboxesEl.insertAdjacentHTML('beforeend', '<p class="empty-state filter-empty">No se encontraron docentes.</p>');
        }
    }
    
    function buscarAsignaturas() {
        const termino = buscadorAsignaturaInput.value.toLowerCase().trim();
        listaAsignaturasResultadosEl.innerHTML = '';
        
        if (termino.length < 2) {
            listaAsignaturasResultadosEl.innerHTML = '<p class="empty-state">Escribe al menos 2 caracteres.</p>';
            return;
        }

        const asignaturasFiltradas = todasLasAsignaturas.filter(asig => 
            asig.nombre.toLowerCase().includes(termino)
        );

        if (asignaturasFiltradas.length > 0) {
            asignaturasFiltradas.forEach(asig => {
                const item = document.createElement('div');
                item.className = 'result-item';
                item.textContent = asig.nombre;
                item.dataset.id = asig.id;
                item.addEventListener('click', () => seleccionarAsignatura(asig));
                listaAsignaturasResultadosEl.appendChild(item);
            });
        } else {
            listaAsignaturasResultadosEl.innerHTML = '<p class="empty-state">No se encontraron asignaturas.</p>';
        }
    }
    
    function seleccionarAsignatura(asignatura) {
        formAgregarAsignatura.asignatura_id.value = asignatura.id;
        
        const infoSeleccion = document.getElementById('asignatura-seleccionada-info');
        const infoTexto = infoSeleccion.querySelector('strong');
        infoTexto.textContent = asignatura.nombre;
        infoSeleccion.style.display = 'block';

        buscadorAsignaturaInput.value = asignatura.nombre;
        listaAsignaturasResultadosEl.innerHTML = '';

        formAgregarAsignatura.querySelector('button[type="submit"]').disabled = false;
    }

    // === EVENT LISTENERS GLOBALES ===
    btnCrearCarrera.addEventListener('click', () => abrirModalCarrera());
    cerrarModalCarreraBtn.addEventListener('click', () => cerrarModal(modalCarrera));
    cerrarModalAgregarAsignaturaBtn.addEventListener('click', () => cerrarModal(modalAgregarAsignatura));
    cerrarModalAsignarDocenteBtn.addEventListener('click', () => cerrarModal(modalAsignarDocente));

    formCarrera.addEventListener('submit', guardarCarrera);
    formAgregarAsignatura.addEventListener('submit', agregarAsignaturaAPlan);
    formAsignarDocente.addEventListener('submit', actualizarDocentesAsignatura);

    buscadorDocenteInput.addEventListener('input', filtrarListaDocentes);
    buscadorAsignaturaInput.addEventListener('input', buscarAsignaturas);

    window.addEventListener('click', e => {
        if (e.target.classList.contains('modal-overlay')) {
            cerrarModal(e.target);
        }
    });

    init();
});