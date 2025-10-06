document.addEventListener('DOMContentLoaded', () => {
    // Selectores de elementos
    const form = document.getElementById('registro-salon-form');
    const tbody = document.querySelector('#tabla-salones tbody');
    const filtroInputs = document.querySelectorAll('.filtro-input'); // NUEVO: Selector de filtros
    const seleccionarTodosCheckbox = document.getElementById('seleccionar-todos');
    const btnEliminarSeleccionado = document.querySelector('.btn-eliminar-seleccionado');
    const btnEditarSeleccionado = document.querySelector('.btn-editar-seleccionado');
    const hiddenSalonId = document.getElementById('salon_id');
    const formContent = document.querySelector('.formulario-content');
    const toggleBtn = document.querySelector('.toggle-form-btn');
    
    let salonesData = [];

    const API_URL = '../api/gestionar_salones.php';

    const mostrarNotificacion = (message, isError = false) => alert(message);

    const cargarSalones = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`Error de red: ${response.status}`);
            salonesData = await response.json();
            renderizarTabla(salonesData);
        } catch (error) {
            console.error('Error al cargar los salones:', error);
            tbody.innerHTML = `<tr><td colspan="5">Error al cargar los datos.</td></tr>`;
        }
    };

    const renderizarTabla = (salones) => {
        // Limpiamos solo el cuerpo, no los filtros de la cabecera
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

    // NUEVO: Función central para aplicar todos los filtros
    const aplicarFiltros = () => {
        const filtros = {};
        filtroInputs.forEach(input => {
            filtros[input.dataset.columna] = input.value.toLowerCase().trim();
        });

        const salonesFiltrados = salonesData.filter(salon => {
            return Object.keys(filtros).every(columna => {
                const valorFiltro = filtros[columna];
                if (!valorFiltro) return true; // Si el filtro está vacío, no se aplica

                // Asegurarse de que el valor del salón exista y convertirlo a string
                const valorSalon = salon[columna] ? String(salon[columna]).toLowerCase() : '';
                
                return valorSalon.includes(valorFiltro);
            });
        });
        renderizarTabla(salonesFiltrados);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        try {
            const response = await fetch(API_URL, { method: 'POST', body: formData });
            const result = await response.json();
            if (result.success) {
                form.reset();
                hiddenSalonId.value = '';
                if (formContent.classList.contains('abierto')) toggleBtn.click();
                mostrarNotificacion(result.message);
                cargarSalones();
            } else {
                mostrarNotificacion(result.message, true);
            }
        } catch (error) {
            mostrarNotificacion('Ocurrió un error de red.', true);
        }
    };

    const iniciarEdicion = (id) => {
        const salon = salonesData.find(s => s.id == id);
        if (!salon) return;
        hiddenSalonId.value = salon.id;
        form.querySelector('#nombre').value = salon.nombre;
        form.querySelector('#capacidad').value = salon.capacidad;
        // CAMBIO: Asignar valor al select
        form.querySelector('#tipo').value = salon.tipo || '';
        if (!formContent.classList.contains('abierto')) toggleBtn.click();
        form.querySelector('h3').textContent = 'Editar Datos del Salón';
        form.querySelector('.btn-guardar').textContent = 'Actualizar Salón';
    };

    const eliminarSalones = async (ids) => {
        if (ids.length === 0) return mostrarNotificacion('Seleccione al menos un salón.');
        if (!confirm(`¿Seguro que quiere eliminar ${ids.length} salón(es)?`)) return;
        try {
            const response = await fetch(API_URL, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            const result = await response.json();
            if (result.success) {
                mostrarNotificacion(result.message);
                cargarSalones();
            } else {
                mostrarNotificacion(result.message, true);
            }
        } catch (error) {
            mostrarNotificacion('Ocurrió un error de red.', true);
        }
    };

    const actualizarEstadoBotones = () => {
        const seleccionados = document.querySelectorAll('.seleccionar-fila:checked').length;
        btnEliminarSeleccionado.disabled = seleccionados === 0;
        btnEditarSeleccionado.disabled = seleccionados !== 1;
    };
    
    // --- Listeners de eventos ---
    form.addEventListener('submit', handleFormSubmit);

    // NUEVO: Listener para todos los inputs de filtro
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
        if (formContent.classList.contains('abierto')) {
            form.reset();
            hiddenSalonId.value = '';
            form.querySelector('h3').textContent = 'Datos del Salón';
            form.querySelector('.btn-guardar').textContent = 'Guardar Salón';
        }
    });

    // Carga inicial
    cargarSalones();
});