// Espera a que todo el contenido del DOM esté cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

    // --- SELECTORES DE ELEMENTOS ---
    const form = document.getElementById('registro-docente-form');
    const tbody = document.querySelector('#tabla-docentes tbody');
    const searchInput = document.getElementById('busqueda');
    const seleccionarTodosCheckbox = document.getElementById('seleccionar-todos');
    const btnEliminarSeleccionado = document.querySelector('.btn-eliminar-seleccionado');
    const btnEditarSeleccionado = document.querySelector('.btn-editar-seleccionado');
    const hiddenDocenteId = document.getElementById('docente_id');
    const formContent = document.querySelector('.formulario-content');
    const toggleBtn = document.querySelector('.toggle-form-btn');
    
    let docentesData = []; // Almacenará los datos de los docentes para búsquedas y ordenamiento

    // --- URL DE LA API ---
    const API_URL = '../api/gestionar_docentes.php';

    /**
     * Muestra una notificación simple en la pantalla.
     * @param {string} message - El mensaje a mostrar.
     * @param {boolean} isError - Si es un mensaje de error.
     */
    const mostrarNotificacion = (message, isError = false) => {
        // En un futuro, puedes reemplazar este 'alert' por una librería de notificaciones más elegante.
        alert(message);
    };

    /**
     * Carga los docentes desde el backend y los renderiza en la tabla.
     */
    const cargarDocentes = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Error de red: ${response.status}`);
            }
            docentesData = await response.json();
            renderizarTabla(docentesData);
        } catch (error) {
            console.error('Error al cargar los docentes:', error);
            tbody.innerHTML = `<tr><td colspan="6">Error al cargar los datos. Verifique la consola.</td></tr>`;
        }
    };

    /**
     * Renderiza (dibuja) las filas de la tabla con los datos de los docentes.
     * @param {Array} docentes - Un array de objetos de docentes.
     */
    const renderizarTabla = (docentes) => {
        tbody.innerHTML = '';
        if (docentes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6">No se encontraron docentes.</td></tr>`;
            return;
        }

        docentes.forEach(docente => {
            const fila = document.createElement('tr');
            fila.dataset.id = docente.id;
            fila.innerHTML = `
                <td><input type="checkbox" class="seleccionar-fila"></td>
                <td>${docente.nombre} ${docente.apellido}</td>
                <td>${docente.asignatura}</td>
                <td>${docente.ano_cursado}º Año</td>
                <td>C.I: ${docente.cedula || 'N/A'} | Tel: ${docente.telefono || 'N/A'}</td>
                <td class="acciones-celda">
                    <button class="btn-accion-fila btn-editar" title="Editar"><i class="fa-solid fa-pencil"></i></button>
                    <button class="btn-accion-fila btn-eliminar" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    };

    /**
     * Maneja el envío del formulario para crear o actualizar un docente.
     */
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                form.reset();
                hiddenDocenteId.value = ''; // Limpiar el ID oculto
                if (formContent.classList.contains('abierto')) {
                     toggleBtn.click(); // Cierra el formulario si está abierto
                }
                mostrarNotificacion(result.message);
                cargarDocentes(); // Recargar la tabla
            } else {
                mostrarNotificacion(result.message, true);
            }
        } catch (error) {
            console.error('Error de red al guardar:', error);
            mostrarNotificacion('Ocurrió un error de red. Intente de nuevo.', true);
        }
    };

    /**
     * Prepara el formulario para editar un docente con sus datos.
     * @param {number} id - El ID del docente a editar.
     */
    const iniciarEdicion = (id) => {
        const docente = docentesData.find(d => d.id == id);
        if (!docente) return;

        // Llenar el formulario con los datos
        hiddenDocenteId.value = docente.id;
        form.querySelector('#nombre').value = docente.nombre;
        form.querySelector('#apellido').value = docente.apellido;
        form.querySelector('#asignatura').value = docente.asignatura;
        form.querySelector('#ano_cursado').value = docente.ano_cursado;
        form.querySelector('#cedula').value = docente.cedula || '';
        form.querySelector('#telefono').value = docente.telefono || '';

        // Abrir el panel del formulario si está cerrado
        if (!formContent.classList.contains('abierto')) {
            toggleBtn.click();
        }
        form.querySelector('h3').textContent = 'Editar Datos del Docente';
        form.querySelector('.btn-guardar').textContent = 'Actualizar Docente';
    };
    
    // Al hacer click en el botón de registrar nuevo, se asegura que el form esté limpio
    toggleBtn.addEventListener('click', () => {
        if (!formContent.classList.contains('abierto')) { // Se va a abrir
            form.reset();
            hiddenDocenteId.value = '';
            form.querySelector('h3').textContent = 'Datos del Docente';
            form.querySelector('.btn-guardar').textContent = 'Guardar Docente';
        }
    });

    /**
     * Elimina los docentes seleccionados (por checkbox o individualmente).
     * @param {Array<number>} idsParaEliminar - Array de IDs a eliminar.
     */
    const eliminarDocentes = async (idsParaEliminar) => {
        if (idsParaEliminar.length === 0) {
            mostrarNotificacion('Por favor, seleccione al menos un docente para eliminar.');
            return;
        }
        if (!confirm(`¿Está seguro de eliminar ${idsParaEliminar.length} docente(s)?`)) {
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: idsParaEliminar })
            });
            const result = await response.json();

            if (result.success) {
                mostrarNotificacion(result.message);
                cargarDocentes();
            } else {
                mostrarNotificacion(result.message, true);
            }
        } catch (error) {
            console.error('Error de red al eliminar:', error);
            mostrarNotificacion('Ocurrió un error de red al intentar eliminar.', true);
        }
    };
    
    /**
     * Habilita o deshabilita los botones de acción múltiple (Editar/Eliminar)
     */
    const actualizarEstadoBotones = () => {
        const seleccionados = document.querySelectorAll('.seleccionar-fila:checked').length;
        btnEliminarSeleccionado.disabled = seleccionados === 0;
        btnEditarSeleccionado.disabled = seleccionados !== 1;
    };

    // --- EVENT LISTENERS ---

    form.addEventListener('submit', handleFormSubmit);
    btnEliminarSeleccionado.addEventListener('click', () => {
        const seleccionados = document.querySelectorAll('.seleccionar-fila:checked');
        const ids = Array.from(seleccionados).map(cb => cb.closest('tr').dataset.id);
        eliminarDocentes(ids);
    });
    
    btnEditarSeleccionado.addEventListener('click', () => {
        const seleccionado = document.querySelector('.seleccionar-fila:checked');
        if (seleccionado) {
            const id = seleccionado.closest('tr').dataset.id;
            iniciarEdicion(id);
        }
    });

    searchInput.addEventListener('input', (e) => {
        const termino = e.target.value.toLowerCase().trim();
        const filtrados = docentesData.filter(d => 
            `${d.nombre} ${d.apellido}`.toLowerCase().includes(termino) ||
            d.asignatura.toLowerCase().includes(termino)
        );
        renderizarTabla(filtrados);
    });

    seleccionarTodosCheckbox.addEventListener('change', (e) => {
        document.querySelectorAll('.seleccionar-fila').forEach(cb => cb.checked = e.target.checked);
        actualizarEstadoBotones();
    });

    tbody.addEventListener('change', (e) => {
        if (e.target.classList.contains('seleccionar-fila')) {
            actualizarEstadoBotones();
        }
    });
    
    // Delegación de eventos para los botones de editar/eliminar de cada fila
    tbody.addEventListener('click', (e) => {
        const btnEditar = e.target.closest('.btn-editar');
        const btnEliminar = e.target.closest('.btn-eliminar');
        
        if (btnEditar) {
            const id = btnEditar.closest('tr').dataset.id;
            iniciarEdicion(id);
        }
        
        if (btnEliminar) {
            const id = btnEliminar.closest('tr').dataset.id;
            eliminarDocentes([id]); // Llama a la función de eliminar con un array de un solo ID
        }
    });

    // --- INICIALIZACIÓN ---
    cargarDocentes();
});
