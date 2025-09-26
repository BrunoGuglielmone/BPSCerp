document.addEventListener('DOMContentLoaded', () => {
    // Selectores de elementos
    const form = document.getElementById('registro-salon-form');
    const tbody = document.querySelector('#tabla-salones tbody');
    const searchInput = document.getElementById('busqueda');
    const seleccionarTodosCheckbox = document.getElementById('seleccionar-todos');
    const btnEliminarSeleccionado = document.querySelector('.btn-eliminar-seleccionado');
    const btnEditarSeleccionado = document.querySelector('.btn-editar-seleccionado');
    const hiddenSalonId = document.getElementById('salon_id');
    const formContent = document.querySelector('.formulario-content');
    const toggleBtn = document.querySelector('.toggle-form-btn');
    
    let salonesData = [];

    // URL de la API
    const API_URL = '../api/gestionar_salones.php';

    // Función de notificación simple
    const mostrarNotificacion = (message, isError = false) => alert(message);

    // Cargar salones desde el backend
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

    // Renderizar la tabla de salones
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

    // Lógica para enviar el formulario (crear/actualizar)
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

    // Lógica para iniciar la edición de un salón
    const iniciarEdicion = (id) => {
        const salon = salonesData.find(s => s.id == id);
        if (!salon) return;
        hiddenSalonId.value = salon.id;
        form.querySelector('#nombre').value = salon.nombre;
        form.querySelector('#capacidad').value = salon.capacidad;
        form.querySelector('#tipo').value = salon.tipo || '';
        if (!formContent.classList.contains('abierto')) toggleBtn.click();
        form.querySelector('h3').textContent = 'Editar Datos del Salón';
        form.querySelector('.btn-guardar').textContent = 'Actualizar Salón';
    };

    // Lógica para eliminar salones
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

    // Actualizar estado de botones de acción masiva
    const actualizarEstadoBotones = () => {
        const seleccionados = document.querySelectorAll('.seleccionar-fila:checked').length;
        btnEliminarSeleccionado.disabled = seleccionados === 0;
        btnEditarSeleccionado.disabled = seleccionados !== 1;
    };
    
    // Listeners de eventos
    form.addEventListener('submit', handleFormSubmit);
    btnEliminarSeleccionado.addEventListener('click', () => {
        const ids = Array.from(document.querySelectorAll('.seleccionar-fila:checked')).map(cb => cb.closest('tr').dataset.id);
        eliminarSalones(ids);
    });
    btnEditarSeleccionado.addEventListener('click', () => {
        const id = document.querySelector('.seleccionar-fila:checked').closest('tr').dataset.id;
        iniciarEdicion(id);
    });
    searchInput.addEventListener('input', (e) => {
        const termino = e.target.value.toLowerCase().trim();
        const filtrados = salonesData.filter(s => s.nombre.toLowerCase().includes(termino) || (s.tipo && s.tipo.toLowerCase().includes(termino)));
        renderizarTabla(filtrados);
    });
    seleccionarTodosCheckbox.addEventListener('change', (e) => {
        document.querySelectorAll('.seleccionar-fila').forEach(cb => cb.checked = e.target.checked);
        actualizarEstadoBotones();
    });
    tbody.addEventListener('change', e => {
        if (e.target.classList.contains('seleccionar-fila')) actualizarEstadoBotones();
    });
    tbody.addEventListener('click', e => {
        const id = e.target.closest('tr')?.dataset.id;
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