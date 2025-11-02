document.addEventListener('DOMContentLoaded', () => {
    // --- SELECTORES DE ELEMENTOS ---
    const form = document.getElementById('registro-docente-form');
    const tbody = document.querySelector('#tabla-docentes tbody');
    const filtroInputs = document.querySelectorAll('.filtro-input');
    const seleccionarTodosCheckbox = document.getElementById('seleccionar-todos');
    const btnEliminarSeleccionado = document.querySelector('.btn-eliminar-seleccionado');
    const btnEditarSeleccionado = document.querySelector('.btn-editar-seleccionado');
    const hiddenDocenteId = document.getElementById('docente_id');
    const formContent = document.querySelector('.formulario-content');
    const toggleBtn = document.querySelector('.toggle-form-btn');
    const cedulaInput = document.getElementById('cedula');
    const telefonoInput = document.getElementById('telefono');
    const formTitle = document.getElementById('form-title');
    const btnGuardarTexto = document.getElementById('btn-guardar-texto');

    // Selectores para Modales de Notificación
    const modalNotificacion = document.getElementById('modal-notificacion');
    const notificacionTitulo = document.getElementById('notificacion-titulo');
    const notificacionMensaje = document.getElementById('notificacion-mensaje');
    const notificacionBtnAceptar = document.getElementById('notificacion-btn-aceptar');
    const notificacionBtnCancelar = document.getElementById('notificacion-btn-cancelar');
    
    let docentesData = [];
    const API_URL = '../api/gestionar_docentes.php';

    // --- FUNCIONES PARA MODALES ---
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

    // --- FUNCIONES PRINCIPALES ---
    const cargarDocentes = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`Error de red: ${response.status}`);
            docentesData = await response.json();
            renderizarTabla(docentesData);
            aplicarFiltros();
        } catch (error) {
            console.error('Error al cargar los docentes:', error);
            tbody.innerHTML = `<tr><td colspan="5">Error al cargar los datos. Verifique la consola.</td></tr>`;
        }
    };

    const renderizarTabla = (docentes) => {
        tbody.innerHTML = '';
        if (docentes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5">No se encontraron docentes.</td></tr>`;
            return;
        }
        docentes.forEach(docente => {
            const fila = document.createElement('tr');
            fila.dataset.id = docente.id;
            fila.innerHTML = `
                <td><input type="checkbox" class="seleccionar-fila"></td>
                <td>${docente.nombre} ${docente.apellido}</td>
                <td>${docente.cedula || 'N/A'}</td>
                <td>${docente.telefono || 'N/A'}</td>
                <td class="acciones-celda">
                    <button class="btn-accion-fila btn-editar" title="Editar"><i class="fa-solid fa-pencil"></i></button>
                    <button class="btn-accion-fila btn-eliminar" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                </td>`;
            tbody.appendChild(fila);
        });
    };
    
    const aplicarFiltros = () => {
        const filtros = {};
        filtroInputs.forEach(input => {
            filtros[input.dataset.columna] = input.value.toLowerCase().trim();
        });

        const docentesFiltrados = docentesData.filter(docente => {
            const nombreCompleto = `${docente.nombre} ${docente.apellido}`.toLowerCase();
            return (filtros.nombre_completo ? nombreCompleto.includes(filtros.nombre_completo) : true) &&
                   (filtros.cedula ? (docente.cedula || '').toLowerCase().includes(filtros.cedula) : true) &&
                   (filtros.telefono ? (docente.telefono || '').toLowerCase().includes(filtros.telefono) : true);
        });
        renderizarTabla(docentesFiltrados);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // --- VALIDACIONES DE CÉDULA ANTES DE ENVIAR ---
        if (cedulaInput.value.length !== 8) {
            await mostrarNotificacion('Error de Validación', 'La cédula debe contener exactamente 8 dígitos numéricos.');
            return;
        }

        // Si es un nuevo docente, verificar si la cédula ya existe
        if (!hiddenDocenteId.value) {
            const cedulaExistente = docentesData.some(doc => doc.cedula === cedulaInput.value);
            if (cedulaExistente) {
                await mostrarNotificacion('Error', `La cédula ${cedulaInput.value} ya se encuentra registrada.`);
                return;
            }
        }

        // Enviar datos
        const response = await fetch(API_URL, { method: 'POST', body: new FormData(form) });
        const result = await response.json();
        
        await mostrarNotificacion(result.success ? 'Éxito' : 'Error', result.message);

        if (response.ok && result.success) {
            resetearFormulario();
            if (formContent.classList.contains('abierto')) toggleBtn.click();
            await cargarDocentes();
        }
    };
    
    const resetearFormulario = () => {
        form.reset();
        hiddenDocenteId.value = '';
        cedulaInput.disabled = false; // Re-habilitar la cédula
        formTitle.textContent = 'Datos del Docente';
        btnGuardarTexto.textContent = 'Guardar Docente';
    };

    const iniciarEdicion = (id) => {
        const docente = docentesData.find(d => d.id == id);
        if (!docente) return;
        
        form.reset();
        hiddenDocenteId.value = docente.id;
        form.querySelector('#nombre').value = docente.nombre;
        form.querySelector('#apellido').value = docente.apellido;
        form.querySelector('#cedula').value = docente.cedula || '';
        form.querySelector('#telefono').value = docente.telefono || '';
        
        cedulaInput.disabled = true; // Deshabilitar cédula en modo edición

        if (!formContent.classList.contains('abierto')) toggleBtn.click();
        formTitle.textContent = 'Editar Datos del Docente';
        btnGuardarTexto.textContent = 'Actualizar Docente';
    };

    const eliminarDocentes = async (ids) => {
        if (ids.length === 0) return;
        const confirmado = await mostrarNotificacion(
            'Confirmar Eliminación',
            `¿Está seguro de que desea eliminar ${ids.length} docente(s)? Esta acción no se puede deshacer.`,
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
            if (result.success) await cargarDocentes();
        } catch (error) {
            await mostrarNotificacion('Error de Conexión', 'Ocurrió un error de red al intentar eliminar.');
        }
    };
    
    const actualizarEstadoBotones = () => {
        const seleccionados = tbody.querySelectorAll('.seleccionar-fila:checked').length;
        btnEliminarSeleccionado.disabled = seleccionados === 0;
        btnEditarSeleccionado.disabled = seleccionados !== 1;
    };

    // --- VALIDACIONES DE INPUT EN TIEMPO REAL ---
    const limitarInputNumerico = (e, maxLength) => {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length > maxLength) {
            value = value.slice(0, maxLength);
        }
        e.target.value = value;
    };

    cedulaInput.addEventListener('input', (e) => limitarInputNumerico(e, 8));
    telefonoInput.addEventListener('input', (e) => limitarInputNumerico(e, 15));

    // --- EVENT LISTENERS ---
    form.addEventListener('submit', handleFormSubmit);
    filtroInputs.forEach(input => input.addEventListener('input', aplicarFiltros));
    
    btnEliminarSeleccionado.addEventListener('click', () => {
        const ids = Array.from(tbody.querySelectorAll('.seleccionar-fila:checked')).map(cb => cb.closest('tr').dataset.id);
        eliminarDocentes(ids);
    });

    btnEditarSeleccionado.addEventListener('click', () => {
        const id = tbody.querySelector('.seleccionar-fila:checked').closest('tr').dataset.id;
        iniciarEdicion(id);
    });

    seleccionarTodosCheckbox.addEventListener('change', (e) => {
        tbody.querySelectorAll('.seleccionar-fila').forEach(cb => cb.checked = e.target.checked);
        actualizarEstadoBotones();
    });

    tbody.addEventListener('change', e => {
        if (e.target.matches('.seleccionar-fila')) {
            actualizarEstadoBotones();
        }
    });

    tbody.addEventListener('click', e => {
        const fila = e.target.closest('tr');
        if (!fila) return;
        const id = fila.dataset.id;
        if (e.target.closest('.btn-editar')) iniciarEdicion(id);
        if (e.target.closest('.btn-eliminar')) eliminarDocentes([id]);
    });

    toggleBtn.addEventListener('click', () => {
        // Si el formulario se está abriendo o no está ya abierto, reset.
        if (!formContent.classList.contains('abierto')) {
            resetearFormulario();
        }
    });

    // --- INICIALIZACIÓN ---
    cargarDocentes();
});