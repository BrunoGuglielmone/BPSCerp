document.addEventListener('DOMContentLoaded', () => {
    // === SELECTORES DE ELEMENTOS ===
    const form = document.getElementById('form-asignatura');
    const tbody = document.querySelector('#tabla-asignaturas tbody');
    const filtroInput = document.querySelector('.filtro-input');
    const seleccionarTodosCheckbox = document.getElementById('seleccionar-todos');
    const btnEliminarSeleccionado = document.querySelector('.btn-eliminar-seleccionado');
    const btnEditarSeleccionado = document.querySelector('.btn-editar-seleccionado');
    const hiddenAsignaturaId = document.getElementById('asignatura_id');
    const formContent = document.querySelector('.formulario-content');
    const toggleBtn = document.querySelector('.toggle-form-btn');
    const formTitle = document.getElementById('form-title');
    const btnGuardarTexto = document.getElementById('btn-guardar-texto');
    
    // === SELECTORES PARA MODALES ===
    const modalNotificacion = document.getElementById('modal-notificacion');
    const notificacionTitulo = document.getElementById('notificacion-titulo');
    const notificacionMensaje = document.getElementById('notificacion-mensaje');
    const notificacionBtnAceptar = document.getElementById('notificacion-btn-aceptar');
    const notificacionBtnCancelar = document.getElementById('notificacion-btn-cancelar');

    let todasLasAsignaturas = [];
    const API_URL = '../api/gestionar_asignaturas.php';

    // === FUNCIÓN PARA MODALES ===
    const mostrarNotificacion = (titulo, mensaje, tipo = 'alerta') => {
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

    // === FUNCIONES PRINCIPALES ===
    const cargarAsignaturas = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Error al cargar los datos.');
            todasLasAsignaturas = await response.json();
            renderizarTabla(todasLasAsignaturas);
            aplicarFiltro(); // Aplicar filtro inicial por si hay texto
        } catch (error) {
            console.error('Error:', error);
            tbody.innerHTML = `<tr><td colspan="3">Error al cargar las asignaturas.</td></tr>`;
        }
    };

    const renderizarTabla = (asignaturas) => {
        tbody.innerHTML = '';
        if (asignaturas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3">No hay asignaturas que coincidan con el filtro.</td></tr>`;
            return;
        }
        asignaturas.forEach(asig => {
            const fila = document.createElement('tr');
            fila.dataset.id = asig.id;
            fila.innerHTML = `
                <td><input type="checkbox" class="seleccionar-fila"></td>
                <td>${asig.nombre}</td>
                <td class="acciones-celda">
                    <button class="btn-accion-fila btn-editar" title="Editar"><i class="fa-solid fa-pencil"></i></button>
                    <button class="btn-accion-fila btn-eliminar" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                </td>`;
            tbody.appendChild(fila);
        });
    };

    const aplicarFiltro = () => {
        const texto = filtroInput.value.toLowerCase().trim();
        const filtradas = todasLasAsignaturas.filter(asig => asig.nombre.toLowerCase().includes(texto));
        renderizarTabla(filtradas);
    };

    const resetearFormulario = () => {
        form.reset();
        hiddenAsignaturaId.value = '';
        formTitle.textContent = 'Nueva Asignatura';
        btnGuardarTexto.textContent = 'Guardar Asignatura';
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        try {
            const response = await fetch(API_URL, { method: 'POST', body: formData });
            const result = await response.json();
            
            await mostrarNotificacion(result.success ? 'Éxito' : 'Error', result.message);

            if (result.success) {
                resetearFormulario();
                if (formContent.classList.contains('abierto')) {
                    toggleBtn.click();
                }
                await cargarAsignaturas();
            }
        } catch (error) {
            console.error('Error al guardar:', error);
            await mostrarNotificacion('Error de Conexión', 'Ocurrió un error al intentar guardar la asignatura.');
        }
    };

    const iniciarEdicion = (id) => {
        const asignatura = todasLasAsignaturas.find(a => a.id == id);
        if (!asignatura) return;

        if (!formContent.classList.contains('abierto')) {
            toggleBtn.click();
        }

        hiddenAsignaturaId.value = asignatura.id;
        form.querySelector('#nombre').value = asignatura.nombre;
        formTitle.textContent = 'Editar Asignatura';
        btnGuardarTexto.textContent = 'Actualizar Asignatura';
        form.querySelector('#nombre').focus();
    };

    const eliminarAsignaturas = async (ids) => {
        if (ids.length === 0) return;
        const confirmado = await mostrarNotificacion(
            'Confirmar Eliminación',
            `¿Está seguro de eliminar ${ids.length} asignatura(s)?<br><br><strong>Advertencia:</strong> Si esta asignatura está en uso en algún plan de estudios, podría causar inconsistencias.`,
            'confirmacion'
        );
        if (!confirmado) return;

        try {
            const response = await fetch(API_URL, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            const result = await response.json();
            await mostrarNotificacion(result.success ? 'Éxito' : 'Error', result.message);
            if (result.success) {
                await cargarAsignaturas();
            }
        } catch (error) {
            await mostrarNotificacion('Error de Conexión', 'Ocurrió un error al intentar eliminar.');
        }
    };

    const actualizarEstadoBotones = () => {
        const seleccionados = tbody.querySelectorAll('.seleccionar-fila:checked').length;
        btnEliminarSeleccionado.disabled = seleccionados === 0;
        btnEditarSeleccionado.disabled = seleccionados !== 1;
    };

    // === EVENT LISTENERS ===
    form.addEventListener('submit', handleFormSubmit);
    filtroInput.addEventListener('input', aplicarFiltro);

    toggleBtn.addEventListener('click', e => {
        formContent.classList.toggle('abierto');
        const icon = e.currentTarget.querySelector('i');
        icon.classList.toggle('fa-plus');
        icon.classList.toggle('fa-chevron-up');

        if (formContent.classList.contains('abierto')) {
            resetearFormulario();
        }
    });

    tbody.addEventListener('click', e => {
        const fila = e.target.closest('tr');
        if (!fila) return;
        const id = fila.dataset.id;
        if (e.target.closest('.btn-editar')) iniciarEdicion(id);
        if (e.target.closest('.btn-eliminar')) eliminarAsignaturas([id]);
    });

    tbody.addEventListener('change', e => {
        if (e.target.matches('.seleccionar-fila')) {
            actualizarEstadoBotones();
        }
    });

    seleccionarTodosCheckbox.addEventListener('change', (e) => {
        tbody.querySelectorAll('.seleccionar-fila').forEach(cb => cb.checked = e.target.checked);
        actualizarEstadoBotones();
    });

    btnEliminarSeleccionado.addEventListener('click', () => {
        const ids = Array.from(tbody.querySelectorAll('.seleccionar-fila:checked')).map(cb => cb.closest('tr').dataset.id);
        eliminarAsignaturas(ids);
    });
    
    btnEditarSeleccionado.addEventListener('click', () => {
        const id = tbody.querySelector('.seleccionar-fila:checked').closest('tr').dataset.id;
        iniciarEdicion(id);
    });

    // Carga inicial
    cargarAsignaturas();
});