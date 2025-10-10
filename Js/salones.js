document.addEventListener('DOMContentLoaded', () => {
    // === SELECTORES DE ELEMENTOS ===
    const form = document.getElementById('registro-salon-form');
    const tbody = document.querySelector('#tabla-salones tbody');
    const filtroInputs = document.querySelectorAll('.filtro-input');
    const seleccionarTodosCheckbox = document.getElementById('seleccionar-todos');
    const btnEliminarSeleccionado = document.querySelector('.btn-eliminar-seleccionado');
    const btnEditarSeleccionado = document.querySelector('.btn-editar-seleccionado');
    const hiddenSalonId = document.getElementById('salon_id');
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
    
    let salonesData = [];
    const API_URL = '../api/gestionar_salones.php';

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
    const cargarSalones = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`Error de red: ${response.status}`);
            salonesData = await response.json();
            renderizarTabla(salonesData);
            aplicarFiltros();
        } catch (error) {
            console.error('Error al cargar los salones:', error);
            tbody.innerHTML = `<tr><td colspan="5">Error al cargar los datos.</td></tr>`;
        }
    };

    const renderizarTabla = (salones) => {
        tbody.innerHTML = ''; 
        if (salones.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5">No se encontraron salones.</td></tr>`;
            return;
        }
        salones.forEach(salon => {
            const fila = document.createElement('tr');
            fila.dataset.id = salon.id;
            fila.innerHTML = `
                <td><input type="checkbox" class="seleccionar-fila"></td>
                <td>${salon.nombre}</td>
                <td>${salon.capacidad}</td>
                <td>${salon.tipo || 'N/A'}</td>
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

        const salonesFiltrados = salonesData.filter(salon => {
            return Object.keys(filtros).every(columna => {
                const valorFiltro = filtros[columna];
                if (!valorFiltro) return true;
                const valorSalon = salon[columna] ? String(salon[columna]).toLowerCase() : '';
                return valorSalon.includes(valorFiltro);
            });
        });
        renderizarTabla(salonesFiltrados);
    };

    const resetearFormulario = () => {
        form.reset();
        hiddenSalonId.value = '';
        formTitle.textContent = 'Datos del Salón';
        btnGuardarTexto.textContent = 'Guardar Salón';
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        // Validar que se haya seleccionado un tipo
        if (!formData.get('tipo')) {
            await mostrarNotificacion('Campo Requerido', 'Por favor, seleccione un tipo de salón.');
            return;
        }

        try {
            const response = await fetch(API_URL, { method: 'POST', body: formData });
            const result = await response.json();
            
            await mostrarNotificacion(result.success ? 'Éxito' : 'Error', result.message);

            if (result.success) {
                resetearFormulario();
                if (formContent.classList.contains('abierto')) toggleBtn.click();
                await cargarSalones();
            }
        } catch (error) {
            await mostrarNotificacion('Error de Conexión', 'Ocurrió un error de red. No se pudo guardar el salón.');
        }
    };

    const iniciarEdicion = (id) => {
        const salon = salonesData.find(s => s.id == id);
        if (!salon) return;
        
        resetearFormulario();
        hiddenSalonId.value = salon.id;
        form.querySelector('#nombre').value = salon.nombre;
        form.querySelector('#capacidad').value = salon.capacidad;
        form.querySelector('#tipo').value = salon.tipo || '';
        
        if (!formContent.classList.contains('abierto')) toggleBtn.click();
        
        formTitle.textContent = 'Editar Datos del Salón';
        btnGuardarTexto.textContent = 'Actualizar Salón';
    };

    const eliminarSalones = async (ids) => {
        if (ids.length === 0) {
            await mostrarNotificacion('Advertencia', 'Por favor, seleccione al menos un salón para eliminar.');
            return;
        }

        const confirmado = await mostrarNotificacion(
            'Confirmar Eliminación',
            `¿Está seguro de que desea eliminar ${ids.length} salón(es)?`,
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
                await cargarSalones();
            }
        } catch (error) {
            await mostrarNotificacion('Error de Conexión', 'Ocurrió un error de red al intentar eliminar.');
        }
    };

    const actualizarEstadoBotones = () => {
        const seleccionados = document.querySelectorAll('.seleccionar-fila:checked').length;
        btnEliminarSeleccionado.disabled = seleccionados === 0;
        btnEditarSeleccionado.disabled = seleccionados !== 1;
    };
    
    // === LISTENERS DE EVENTOS ===
    form.addEventListener('submit', handleFormSubmit);

    filtroInputs.forEach(input => {
        input.addEventListener('input', aplicarFiltros);
    });

    btnEliminarSeleccionado.addEventListener('click', () => {
        const ids = Array.from(document.querySelectorAll('.seleccionar-fila:checked')).map(cb => cb.closest('tr').dataset.id);
        eliminarSalones(ids);
    });

    btnEditarSeleccionado.addEventListener('click', () => {
        const id = document.querySelector('.seleccionar-fila:checked').closest('tr').dataset.id;
        iniciarEdicion(id);
    });
    
    seleccionarTodosCheckbox.addEventListener('change', (e) => {
        document.querySelectorAll('.seleccionar-fila').forEach(cb => cb.checked = e.target.checked);
        actualizarEstadoBotones();
    });

    tbody.addEventListener('change', e => {
        if (e.target.classList.contains('seleccionar-fila')) actualizarEstadoBotones();
    });

    tbody.addEventListener('click', e => {
        const fila = e.target.closest('tr');
        if (!fila) return;
        const id = fila.dataset.id;
        if (!id) return;
        if (e.target.closest('.btn-editar')) iniciarEdicion(id);
        if (e.target.closest('.btn-eliminar')) eliminarSalones([id]);
    });
    
    toggleBtn.addEventListener('click', () => {
        if (!formContent.classList.contains('abierto')) {
            resetearFormulario();
        }
    });

    // Carga inicial
    cargarSalones();
});