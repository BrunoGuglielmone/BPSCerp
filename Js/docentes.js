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
    
    let docentesData = [];
    const API_URL = '../api/gestionar_docentes.php';

    // --- FUNCIONES ---

    const mostrarNotificacion = (message) => alert(message);

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
        const response = await fetch(API_URL, { method: 'POST', body: new FormData(form) });
        const result = await response.json();
        mostrarNotificacion(result.message);
        if (response.ok && result.success) {
            form.reset();
            hiddenDocenteId.value = '';
            if (formContent.classList.contains('abierto')) toggleBtn.click();
            cargarDocentes();
        }
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

        if (!formContent.classList.contains('abierto')) toggleBtn.click();
        form.querySelector('h3').textContent = 'Editar Datos del Docente';
        form.querySelector('.btn-guardar').textContent = 'Actualizar Docente';
    };

    const eliminarDocentes = async (ids) => {
        if (ids.length === 0 || !confirm(`¿Está seguro de eliminar ${ids.length} docente(s)?`)) return;

        try {
            const response = await fetch(API_URL, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            const result = await response.json();
            mostrarNotificacion(result.message);
            if (result.success) cargarDocentes();
        } catch (error) {
            mostrarNotificacion('Ocurrió un error de red al intentar eliminar.', true);
        }
    };
    
    const actualizarEstadoBotones = () => {
        const seleccionados = tbody.querySelectorAll('.seleccionar-fila:checked').length;
        btnEliminarSeleccionado.disabled = seleccionados === 0;
        btnEditarSeleccionado.disabled = seleccionados !== 1;
    };

    // --- VALIDACIONES DE INPUT EN TIEMPO REAL ---

    cedulaInput.addEventListener('input', (e) => {
        let value = e.target.value;
        // Reemplazar cualquier caracter que no sea un número
        value = value.replace(/[^0-9]/g, '');
        // Limitar la longitud a 7 caracteres
        if (value.length > 7) {
            value = value.slice(0, 7);
        }
        e.target.value = value;
    });

    telefonoInput.addEventListener('input', (e) => {
        let value = e.target.value;
        // Reemplazar cualquier caracter que no sea un número
        value = value.replace(/[^0-9]/g, '');
        // Limitar la longitud a 15 caracteres
        if (value.length > 15) {
            value = value.slice(0, 15);
        }
        e.target.value = value;
    });


    // --- EVENT LISTENERS (sin cambios, excepto en el toggleBtn) ---
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
        if (!formContent.classList.contains('abierto')) {
            form.reset();
            hiddenDocenteId.value = '';
            form.querySelector('h3').textContent = 'Datos del Docente';
            form.querySelector('.btn-guardar').textContent = 'Guardar Docente';
        }
    });

    // --- INICIALIZACIÓN ---
    cargarDocentes();
});