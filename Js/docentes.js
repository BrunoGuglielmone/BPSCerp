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
            aplicarFiltros(); // Re-aplica filtros por si había algo escrito
        } catch (error) {
            console.error('Error al cargar los docentes:', error);
            tbody.innerHTML = `<tr><td colspan="7">Error al cargar los datos. Verifique la consola.</td></tr>`;
        }
    };

    const renderizarTabla = (docentes) => {
        tbody.innerHTML = '';
        if (docentes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7">No se encontraron docentes con los filtros aplicados.</td></tr>`;
            return;
        }
        docentes.forEach(docente => {
            const fila = document.createElement('tr');
            fila.dataset.id = docente.id;
            fila.innerHTML = `
                <td><input type="checkbox" class="seleccionar-fila"></td>
                <td>${docente.nombre} ${docente.apellido}</td>
                <td>${docente.asignatura_nombre || 'N/A'}</td>
                <td>${docente.ano_cursado}º Año</td>
                <td>${docente.carreras_nombres || 'N/A'}</td>
                <td>C.I: ${docente.cedula || 'N/A'}</td>
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
            const otrosDatos = `C.I: ${docente.cedula || ''}`.toLowerCase();
            
            return (filtros.nombre_completo ? nombreCompleto.includes(filtros.nombre_completo) : true) &&
                   (filtros.asignatura_nombre ? (docente.asignatura_nombre || '').toLowerCase().includes(filtros.asignatura_nombre) : true) &&
                   (filtros.ano_cursado ? String(docente.ano_cursado).includes(filtros.ano_cursado) : true) &&
                   (filtros.carreras_nombres ? (docente.carreras_nombres || '').toLowerCase().includes(filtros.carreras_nombres) : true) &&
                   (filtros.otros_datos ? otrosDatos.includes(filtros.otros_datos) : true);
        });
        renderizarTabla(docentesFiltrados);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch(API_URL, { method: 'POST', body: new FormData(form) });
        const result = await response.json();
        mostrarNotificacion(result.message);
        if (result.success) {
            form.reset();
            hiddenDocenteId.value = '';
            if (formContent.classList.contains('abierto')) toggleBtn.click();
            cargarDocentes();
        }
    };

    const iniciarEdicion = (id) => {
        const docente = docentesData.find(d => d.id == id);
        if (!docente) return;
        
        form.reset(); // Limpia el formulario y los checkboxes
        hiddenDocenteId.value = docente.id;
        form.querySelector('#nombre').value = docente.nombre;
        form.querySelector('#apellido').value = docente.apellido;
        form.querySelector('#asignatura_id').value = docente.asignatura_id;
        form.querySelector('#ano_cursado').value = docente.ano_cursado;
        form.querySelector('#cedula').value = docente.cedula || '';
        form.querySelector('#telefono').value = docente.telefono || '';

        // Marcar los checkboxes de las carreras correspondientes
        if (docente.carreras_ids) {
            const carrerasIds = docente.carreras_ids.split(',');
            carrerasIds.forEach(carreraId => {
                const checkbox = form.querySelector(`input[name="carreras[]"][value="${carreraId}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

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
        // Si el formulario se va a abrir, nos aseguramos que esté en modo "Registro"
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